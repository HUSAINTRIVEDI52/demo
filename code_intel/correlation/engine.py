"""
Correlation Engine

Combines static analysis results with runtime execution data and leak
findings to produce a unified intelligence report.

- Marks functions as "dead" if they appear in the static call graph
  but were never executed in production during the configured time window.
- Correlates leak findings with specific source code paths.
"""

from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

from ..static_analyzer.call_graph import CallGraphBuilder, FunctionInfo
from ..static_analyzer.unused_imports import UnusedImport
from ..static_analyzer.unreachable_code import UnreachableFinding
from ..leak_detector.patterns import LeakFinding, Severity
from ..leak_detector.log_scanner import ScanResult


@dataclass
class DeadCodeFinding:
    """A function identified as dead code."""
    function_name: str
    qualified_name: str
    file_path: str
    line_number: int
    end_line: int
    reason: str          # "never_executed", "no_callers", "unreachable"
    confidence: str      # "high", "medium", "low"
    last_executed: Optional[str] = None
    execution_count: int = 0
    is_endpoint: bool = False

    def to_dict(self) -> dict:
        return {
            "function_name": self.function_name,
            "qualified_name": self.qualified_name,
            "file": self.file_path,
            "line": self.line_number,
            "end_line": self.end_line,
            "reason": self.reason,
            "confidence": self.confidence,
            "last_executed": self.last_executed,
            "execution_count": self.execution_count,
            "is_endpoint": self.is_endpoint,
        }


@dataclass
class CorrelatedLeak:
    """A leak finding enriched with source code context."""
    leak: LeakFinding
    source_function: Optional[str] = None
    source_file: Optional[str] = None
    source_line: Optional[int] = None
    code_path: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        d = self.leak.to_dict()
        d.update({
            "source_function": self.source_function,
            "source_file": self.source_file,
            "source_line": self.source_line,
            "code_path": self.code_path,
        })
        return d


@dataclass
class IntelligenceReport:
    """Complete intelligence report combining all analysis results."""
    timestamp: str
    target_dir: str
    time_window_days: int

    # Static analysis results
    total_functions: int = 0
    total_classes: int = 0
    total_endpoints: int = 0

    # Findings
    dead_code: list[DeadCodeFinding] = field(default_factory=list)
    unused_imports: list[dict] = field(default_factory=list)
    unreachable_code: list[dict] = field(default_factory=list)
    leak_findings: list[CorrelatedLeak] = field(default_factory=list)

    # Summary
    parse_errors: list[dict] = field(default_factory=list)

    @property
    def dead_code_count(self) -> int:
        return len(self.dead_code)

    @property
    def dead_code_percentage(self) -> float:
        if self.total_functions == 0:
            return 0.0
        return (self.dead_code_count / self.total_functions) * 100

    @property
    def critical_leaks(self) -> list[CorrelatedLeak]:
        return [l for l in self.leak_findings if l.leak.severity == Severity.CRITICAL]

    @property
    def high_leaks(self) -> list[CorrelatedLeak]:
        return [l for l in self.leak_findings if l.leak.severity == Severity.HIGH]

    @property
    def has_critical_issues(self) -> bool:
        return len(self.critical_leaks) > 0

    def to_dict(self) -> dict:
        return {
            "metadata": {
                "timestamp": self.timestamp,
                "target_dir": self.target_dir,
                "time_window_days": self.time_window_days,
                "generator": "Code Usage Intelligence System v1.0.0",
            },
            "summary": {
                "total_functions": self.total_functions,
                "total_classes": self.total_classes,
                "total_endpoints": self.total_endpoints,
                "dead_code_count": self.dead_code_count,
                "dead_code_percentage": round(self.dead_code_percentage, 1),
                "unused_imports_count": len(self.unused_imports),
                "unreachable_code_count": len(self.unreachable_code),
                "total_leaks": len(self.leak_findings),
                "critical_leaks": len(self.critical_leaks),
                "high_leaks": len(self.high_leaks),
                "has_critical_issues": self.has_critical_issues,
            },
            "dead_code": [d.to_dict() for d in self.dead_code],
            "unused_imports": self.unused_imports,
            "unreachable_code": self.unreachable_code,
            "leak_findings": [l.to_dict() for l in self.leak_findings],
            "parse_errors": self.parse_errors,
        }


class CorrelationEngine:
    """
    Correlates static analysis, runtime metrics, and leak detection results
    into a unified intelligence report.
    
    Usage:
        engine = CorrelationEngine(time_window_days=30)
        
        # Set data sources
        engine.set_call_graph(call_graph_builder)
        engine.set_runtime_data(executed_functions)
        engine.set_unused_imports(unused_imports)
        engine.set_unreachable_code(unreachable_findings)
        engine.set_leak_results(leak_scan_result)
        
        # Generate report
        report = engine.correlate()
    """

    def __init__(self, time_window_days: int = 30,
                 exclude_patterns: list[str] = None):
        self.time_window_days = time_window_days
        self.exclude_patterns = exclude_patterns or ["test_*", "__*__"]

        # Data sources
        self._call_graph: Optional[CallGraphBuilder] = None
        self._runtime_data: dict[str, dict] = {}        # {func_name: {count, last_executed, ...}}
        self._executed_functions: set[str] = set()
        self._unused_imports: list[UnusedImport] = []
        self._unreachable_code: list[UnreachableFinding] = []
        self._leak_findings: list[LeakFinding] = []
        self._target_dir: str = ""

    def set_call_graph(self, graph: CallGraphBuilder):
        """Set the static call graph."""
        self._call_graph = graph

    def set_runtime_data(self, data: dict[str, dict],
                         executed_names: set[str] = None):
        """Set runtime execution data."""
        self._runtime_data = data
        self._executed_functions = executed_names or set(data.keys())

    def set_unused_imports(self, imports: list[UnusedImport]):
        """Set unused import findings."""
        self._unused_imports = imports

    def set_unreachable_code(self, findings: list[UnreachableFinding]):
        """Set unreachable code findings."""
        self._unreachable_code = findings

    def set_leak_results(self, findings: list[LeakFinding]):
        """Set leak detection findings."""
        self._leak_findings = findings

    def correlate(self, target_dir: str = "") -> IntelligenceReport:
        """
        Run correlation and produce a unified intelligence report.
        """
        report = IntelligenceReport(
            timestamp=datetime.now().isoformat(),
            target_dir=target_dir or self._target_dir,
            time_window_days=self.time_window_days,
        )

        if self._call_graph:
            report.total_functions = len(self._call_graph.functions)
            report.total_classes = len(self._call_graph.classes)
            report.total_endpoints = len(self._call_graph.get_endpoints())
            report.parse_errors = self._call_graph.errors

            # ── Dead Code Detection ──
            report.dead_code = self._find_dead_code()

        # ── Unused Imports ──
        report.unused_imports = [
            {
                "module": imp.module,
                "name": imp.name,
                "alias": imp.alias,
                "file": imp.file_path,
                "line": imp.line_number,
                "import_statement": imp.import_statement,
            }
            for imp in self._unused_imports
        ]

        # ── Unreachable Code ──
        report.unreachable_code = [
            {
                "file": f.file_path,
                "line": f.line_number,
                "end_line": f.end_line,
                "type": f.finding_type,
                "description": f.description,
                "snippet": f.code_snippet,
                "severity": f.severity,
            }
            for f in self._unreachable_code
        ]

        # ── Leak Correlation ──
        report.leak_findings = self._correlate_leaks()

        return report

    def _find_dead_code(self) -> list[DeadCodeFinding]:
        """
        Compare static call graph against runtime execution data.
        Functions present in static analysis but not in runtime data
        are marked as dead code.
        """
        dead = []

        for qualified_name, func in self._call_graph.functions.items():
            # Skip excluded patterns
            if self._is_excluded(func.name):
                continue

            # Skip special methods
            if func.name.startswith("__") and func.name.endswith("__"):
                continue

            runtime_info = self._runtime_data.get(qualified_name, {})
            exec_count = runtime_info.get("count", 0)

            if self._executed_functions and qualified_name not in self._executed_functions:
                # Never executed in the time window
                confidence = self._assess_confidence(func)

                dead.append(DeadCodeFinding(
                    function_name=func.name,
                    qualified_name=qualified_name,
                    file_path=func.file_path,
                    line_number=func.line_number,
                    end_line=func.end_line,
                    reason="never_executed",
                    confidence=confidence,
                    last_executed=runtime_info.get("last_executed"),
                    execution_count=exec_count,
                    is_endpoint=func.is_endpoint,
                ))

            elif not self._executed_functions and not func.called_by and not func.is_endpoint:
                # No runtime data available — fall back to static analysis
                if func.name not in ("main", "setup", "configure", "cli"):
                    dead.append(DeadCodeFinding(
                        function_name=func.name,
                        qualified_name=qualified_name,
                        file_path=func.file_path,
                        line_number=func.line_number,
                        end_line=func.end_line,
                        reason="no_callers",
                        confidence="low",
                        is_endpoint=func.is_endpoint,
                    ))

        return dead

    def _assess_confidence(self, func: FunctionInfo) -> str:
        """Assess confidence level for a dead code finding."""
        # Endpoints that are never executed → high confidence
        if func.is_endpoint:
            return "high"

        # Functions with no callers in the static graph either → high
        if not func.called_by:
            return "high"

        # Functions that have callers but none of them were executed → medium
        if func.called_by:
            any_caller_executed = any(
                caller in self._executed_functions
                for caller in func.called_by
            )
            if not any_caller_executed:
                return "medium"

        return "low"

    def _correlate_leaks(self) -> list[CorrelatedLeak]:
        """Enrich leak findings with source code path information."""
        correlated = []

        for leak in self._leak_findings:
            source_func = None
            code_path = []

            # Try to map the leak to a function in the call graph
            if self._call_graph:
                source_func = self._find_function_at(
                    leak.file_path, leak.line_number
                )
                if source_func:
                    # Build the code path (caller chain)
                    code_path = self._build_code_path(source_func)

            correlated.append(CorrelatedLeak(
                leak=leak,
                source_function=source_func,
                source_file=leak.file_path,
                source_line=leak.line_number,
                code_path=code_path,
            ))

        return correlated

    def _find_function_at(self, file_path: str, line: int) -> Optional[str]:
        """Find the function containing a specific line in a file."""
        if not self._call_graph:
            return None

        best_match = None
        best_range = float("inf")

        for qn, func in self._call_graph.functions.items():
            if not func.file_path.endswith(file_path) and file_path not in func.file_path:
                # Normalize path comparison
                import os
                if os.path.basename(func.file_path) != os.path.basename(file_path):
                    continue

            if func.line_number <= line <= func.end_line:
                func_range = func.end_line - func.line_number
                if func_range < best_range:
                    best_match = qn
                    best_range = func_range

        return best_match

    def _build_code_path(self, function_name: str, max_depth: int = 5) -> list[str]:
        """Build the caller chain for a function."""
        path = [function_name]
        visited = {function_name}
        current = function_name
        depth = 0

        while depth < max_depth and self._call_graph:
            func = self._call_graph.functions.get(current)
            if not func or not func.called_by:
                break

            # Pick the first unvisited caller
            next_caller = None
            for caller in func.called_by:
                if caller not in visited:
                    next_caller = caller
                    break

            if not next_caller:
                break

            path.append(next_caller)
            visited.add(next_caller)
            current = next_caller
            depth += 1

        return list(reversed(path))

    def _is_excluded(self, name: str) -> bool:
        """Check if a function name matches exclusion patterns."""
        import fnmatch
        for pattern in self.exclude_patterns:
            if fnmatch.fnmatch(name, pattern):
                return True
        return False
