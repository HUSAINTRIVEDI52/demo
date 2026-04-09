"""
Log Scanner

Scans log files and directories for sensitive data patterns.
Supports various log formats and can process large files efficiently.
"""

import os
import glob
from dataclasses import dataclass
from typing import Generator

from .patterns import LeakPatternMatcher, LeakFinding, Severity


@dataclass
class ScanResult:
    """Aggregated scan results for a log source."""
    files_scanned: int
    total_lines: int
    findings: list[LeakFinding]
    errors: list[dict]

    @property
    def total_findings(self) -> int:
        return len(self.findings)

    @property
    def critical_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == Severity.CRITICAL)

    @property
    def high_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == Severity.HIGH)

    @property
    def has_critical(self) -> bool:
        return self.critical_count > 0

    def to_dict(self) -> dict:
        return {
            "files_scanned": self.files_scanned,
            "total_lines": self.total_lines,
            "total_findings": self.total_findings,
            "critical": self.critical_count,
            "high": self.high_count,
            "findings": [f.to_dict() for f in self.findings],
            "errors": self.errors,
            "severity_breakdown": self._severity_breakdown(),
        }

    def _severity_breakdown(self) -> dict:
        breakdown = {}
        for finding in self.findings:
            sev = finding.severity.value
            breakdown[sev] = breakdown.get(sev, 0) + 1
        return breakdown


class LogScanner:
    """
    Scans log files for sensitive data leaks.
    
    Usage:
        scanner = LogScanner()
        
        # Scan a single file
        result = scanner.scan_file("app.log")
        
        # Scan a directory
        result = scanner.scan_directory("/var/log/myapp/")
        
        # Scan with custom patterns
        scanner = LogScanner(enabled_patterns={"credit_cards": True, "emails": False})
    """

    # Default log file extensions
    LOG_EXTENSIONS = {".log", ".txt", ".out", ".err", ".json"}

    # Maximum file size to scan (100MB)
    MAX_FILE_SIZE = 100 * 1024 * 1024

    def __init__(self, enabled_patterns: dict[str, bool] = None,
                 max_file_size: int = None):
        self.matcher = LeakPatternMatcher(enabled_patterns=enabled_patterns)
        self.max_file_size = max_file_size or self.MAX_FILE_SIZE

    def scan_file(self, file_path: str) -> ScanResult:
        """Scan a single log file for sensitive data."""
        findings = []
        errors = []
        total_lines = 0

        try:
            file_size = os.path.getsize(file_path)
            if file_size > self.max_file_size:
                errors.append({
                    "file": file_path,
                    "error": f"File too large ({file_size} bytes, max {self.max_file_size})",
                })
                return ScanResult(
                    files_scanned=1,
                    total_lines=0,
                    findings=[],
                    errors=errors,
                )

            # Process file in chunks of lines for memory efficiency
            for chunk_findings, lines_count in self._scan_file_chunked(file_path):
                findings.extend(chunk_findings)
                total_lines += lines_count

        except PermissionError:
            errors.append({"file": file_path, "error": "Permission denied"})
        except Exception as e:
            errors.append({"file": file_path, "error": str(e)})

        return ScanResult(
            files_scanned=1,
            total_lines=total_lines,
            findings=findings,
            errors=errors,
        )

    def _scan_file_chunked(self, file_path: str,
                           chunk_size: int = 1000) -> Generator:
        """Process a file in chunks of lines for memory efficiency."""
        buffer = []
        line_offset = 0

        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            for line_num, line in enumerate(f, 1):
                buffer.append(line)

                if len(buffer) >= chunk_size:
                    chunk_text = "".join(buffer)
                    findings = self.matcher.scan_text(chunk_text, file_path)

                    # Adjust line numbers based on offset
                    for finding in findings:
                        finding.line_number += line_offset

                    yield findings, len(buffer)
                    line_offset += len(buffer)
                    buffer = []

        # Process remaining lines
        if buffer:
            chunk_text = "".join(buffer)
            findings = self.matcher.scan_text(chunk_text, file_path)
            for finding in findings:
                finding.line_number += line_offset
            yield findings, len(buffer)

    def scan_directory(self, dir_path: str,
                       extensions: set[str] = None,
                       recursive: bool = True) -> ScanResult:
        """Scan all log files in a directory."""
        exts = extensions or self.LOG_EXTENSIONS
        all_findings = []
        all_errors = []
        files_scanned = 0
        total_lines = 0

        log_files = self._collect_log_files(dir_path, exts, recursive)

        for file_path in log_files:
            result = self.scan_file(file_path)
            all_findings.extend(result.findings)
            all_errors.extend(result.errors)
            files_scanned += 1
            total_lines += result.total_lines

        return ScanResult(
            files_scanned=files_scanned,
            total_lines=total_lines,
            findings=all_findings,
            errors=all_errors,
        )

    def scan_source_directory(self, dir_path: str,
                              exclude_dirs: list[str] = None) -> ScanResult:
        """
        Scan source code files for risky logging patterns and hardcoded secrets.
        This uses the source-aware scanner that checks for risky logging patterns.
        """
        exclude = set(exclude_dirs or ["venv", ".venv", ".git", "__pycache__", "node_modules"])
        all_findings = []
        all_errors = []
        files_scanned = 0
        total_lines = 0

        for root, dirs, files in os.walk(dir_path):
            dirs[:] = [d for d in dirs if d not in exclude and not d.startswith(".")]

            for filename in files:
                if not any(filename.endswith(ext) for ext in [".py", ".js", ".ts", ".jsx", ".tsx"]):
                    continue

                file_path = os.path.join(root, filename)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        source = f.read()

                    findings = self.matcher.scan_source(source, file_path)
                    all_findings.extend(findings)
                    total_lines += source.count("\n") + 1
                    files_scanned += 1

                except Exception as e:
                    all_errors.append({"file": file_path, "error": str(e)})

        return ScanResult(
            files_scanned=files_scanned,
            total_lines=total_lines,
            findings=all_findings,
            errors=all_errors,
        )

    def _collect_log_files(self, dir_path: str, extensions: set[str],
                           recursive: bool) -> list[str]:
        """Collect all log files from a directory."""
        files = []

        if recursive:
            for root, dirs, filenames in os.walk(dir_path):
                for filename in filenames:
                    if any(filename.endswith(ext) for ext in extensions):
                        files.append(os.path.join(root, filename))
        else:
            for filename in os.listdir(dir_path):
                if any(filename.endswith(ext) for ext in extensions):
                    files.append(os.path.join(dir_path, filename))

        return sorted(files)
