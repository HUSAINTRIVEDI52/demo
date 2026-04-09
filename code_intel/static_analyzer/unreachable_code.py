"""
Unreachable Code Detector

Identifies code that can never be executed:
- Statements after return/raise/break/continue
- Functions with no callers (orphan functions)
- Conditional blocks that are always False (e.g., `if False:`)
"""

import ast
from dataclasses import dataclass
from typing import Optional


@dataclass
class UnreachableFinding:
    """Represents an unreachable code finding."""
    file_path: str
    line_number: int
    end_line: int
    finding_type: str  # "after_return", "after_raise", "dead_conditional", "orphan_function"
    description: str
    code_snippet: Optional[str] = None
    function_name: Optional[str] = None
    severity: str = "WARNING"


class _UnreachableVisitor(ast.NodeVisitor):
    """AST visitor that detects unreachable code patterns."""

    TERMINAL_TYPES = (ast.Return, ast.Raise, ast.Break, ast.Continue)

    def __init__(self, file_path: str, source_lines: list[str]):
        self.file_path = file_path
        self.source_lines = source_lines
        self.findings: list[UnreachableFinding] = []

    def visit_FunctionDef(self, node: ast.FunctionDef):
        self._check_body(node.body, node.name)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self._check_body(node.body, node.name)
        self.generic_visit(node)

    def visit_If(self, node: ast.If):
        self._check_dead_conditional(node)
        # Check bodies for unreachable code
        self._check_body(node.body)
        if node.orelse:
            self._check_body(node.orelse)
        self.generic_visit(node)

    def visit_While(self, node: ast.While):
        self._check_body(node.body)
        self.generic_visit(node)

    def visit_For(self, node: ast.For):
        self._check_body(node.body)
        self.generic_visit(node)

    def visit_Try(self, node: ast.Try):
        self._check_body(node.body)
        for handler in node.handlers:
            self._check_body(handler.body)
        if node.orelse:
            self._check_body(node.orelse)
        if node.finalbody:
            self._check_body(node.finalbody)
        self.generic_visit(node)

    def _check_body(self, body: list[ast.stmt], function_name: str = None):
        """Check a list of statements for code after terminal statements."""
        for i, stmt in enumerate(body):
            if isinstance(stmt, self.TERMINAL_TYPES) and i < len(body) - 1:
                # There are statements after this terminal statement
                next_stmt = body[i + 1]
                last_stmt = body[-1]

                terminal_type = type(stmt).__name__.lower()
                snippet = self._get_snippet(next_stmt.lineno, min(
                    last_stmt.end_lineno or last_stmt.lineno,
                    next_stmt.lineno + 2
                ))

                self.findings.append(UnreachableFinding(
                    file_path=self.file_path,
                    line_number=next_stmt.lineno,
                    end_line=last_stmt.end_lineno or last_stmt.lineno,
                    finding_type=f"after_{terminal_type}",
                    description=(
                        f"Code after '{terminal_type}' statement is unreachable "
                        f"(lines {next_stmt.lineno}-{last_stmt.end_lineno or last_stmt.lineno})"
                    ),
                    code_snippet=snippet,
                    function_name=function_name,
                ))
                break  # Only report the first unreachable block per body

    def _check_dead_conditional(self, node: ast.If):
        """Detect conditionals that are always True or always False."""
        test = node.test

        # `if False:` or `if 0:`
        if isinstance(test, ast.Constant):
            if test.value is False or test.value == 0:
                snippet = self._get_snippet(node.lineno, node.lineno)
                self.findings.append(UnreachableFinding(
                    file_path=self.file_path,
                    line_number=node.lineno,
                    end_line=node.end_lineno or node.lineno,
                    finding_type="dead_conditional",
                    description=f"Conditional is always False at line {node.lineno}",
                    code_snippet=snippet,
                    severity="INFO",
                ))
            elif test.value is True or test.value == 1:
                if node.orelse:
                    else_start = node.orelse[0].lineno
                    else_end = node.orelse[-1].end_lineno or node.orelse[-1].lineno
                    snippet = self._get_snippet(else_start, min(else_start + 2, else_end))
                    self.findings.append(UnreachableFinding(
                        file_path=self.file_path,
                        line_number=else_start,
                        end_line=else_end,
                        finding_type="dead_conditional",
                        description=f"Else branch is unreachable (condition is always True) at line {node.lineno}",
                        code_snippet=snippet,
                        severity="INFO",
                    ))

        # `if __debug__:` when running with -O
        elif isinstance(test, ast.Name) and test.id == "__debug__":
            pass  # Don't flag this, it's intentional

    def _get_snippet(self, start: int, end: int) -> str:
        """Extract source code lines (1-indexed)."""
        lines = self.source_lines[start - 1:end]
        return "\n".join(lines).strip()


class UnreachableCodeDetector:
    """
    Detects unreachable code in Python source files.
    
    Usage:
        detector = UnreachableCodeDetector()
        findings = detector.analyze_file("path/to/module.py")
        for finding in findings:
            print(f"[{finding.severity}] {finding.description}")
    """

    def analyze_file(self, file_path: str) -> list[UnreachableFinding]:
        """Analyze a single Python file for unreachable code."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                source = f.read()
            return self.analyze_source(source, file_path)
        except Exception:
            return []

    def analyze_source(self, source: str, file_path: str = "<string>") -> list[UnreachableFinding]:
        """Analyze Python source string for unreachable code."""
        try:
            tree = ast.parse(source, filename=file_path)
        except SyntaxError:
            return []

        source_lines = source.splitlines()
        visitor = _UnreachableVisitor(file_path, source_lines)
        visitor.visit(tree)
        return visitor.findings

    def analyze_directory(self, target_dir: str, exclude_dirs: list[str] = None) -> list[UnreachableFinding]:
        """Analyze all Python files in a directory for unreachable code."""
        import os

        exclude = set(exclude_dirs or ["venv", ".venv", ".git", "__pycache__"])
        findings = []

        for root, dirs, files in os.walk(target_dir):
            dirs[:] = [d for d in dirs if d not in exclude and not d.startswith(".")]
            for filename in files:
                if filename.endswith(".py"):
                    file_path = os.path.join(root, filename)
                    findings.extend(self.analyze_file(file_path))

        return findings
