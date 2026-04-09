"""
Unused Import Detector

Parses Python source files and detects import statements where the imported
names are never referenced in the module body.
"""

import ast
from dataclasses import dataclass
from typing import Optional


@dataclass
class UnusedImport:
    """Represents an unused import finding."""
    module: str
    name: str
    alias: Optional[str]
    file_path: str
    line_number: int
    import_statement: str

    @property
    def display_name(self) -> str:
        if self.alias:
            return f"{self.name} as {self.alias}"
        return self.name


class _NameCollector(ast.NodeVisitor):
    """Collects all Name references in the AST, excluding import statements."""

    def __init__(self):
        self.names: set[str] = set()
        self._in_import = False

    def visit_Import(self, node: ast.Import):
        pass  # Skip import statements

    def visit_ImportFrom(self, node: ast.ImportFrom):
        pass  # Skip import statements

    def visit_Name(self, node: ast.Name):
        self.names.add(node.id)
        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute):
        # Collect the root name of attribute chains (e.g., "os" from "os.path.join")
        root = node
        while isinstance(root, ast.Attribute):
            root = root.value
        if isinstance(root, ast.Name):
            self.names.add(root.id)
        self.generic_visit(node)


class _ImportCollector(ast.NodeVisitor):
    """Collects all import statements from the AST."""

    def __init__(self):
        self.imports: list[dict] = []

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            local_name = alias.asname if alias.asname else alias.name.split(".")[0]
            self.imports.append({
                "module": alias.name,
                "name": alias.name,
                "alias": alias.asname,
                "local_name": local_name,
                "line": node.lineno,
                "statement": f"import {alias.name}" + (f" as {alias.asname}" if alias.asname else ""),
            })

    def visit_ImportFrom(self, node: ast.ImportFrom):
        module = node.module or ""
        for alias in node.names:
            if alias.name == "*":
                continue  # Can't analyze star imports
            local_name = alias.asname if alias.asname else alias.name
            self.imports.append({
                "module": module,
                "name": alias.name,
                "alias": alias.asname,
                "local_name": local_name,
                "line": node.lineno,
                "statement": f"from {module} import {alias.name}" + (f" as {alias.asname}" if alias.asname else ""),
            })


class UnusedImportDetector:
    """
    Detects unused imports in Python source files.
    
    Usage:
        detector = UnusedImportDetector()
        findings = detector.analyze_file("path/to/module.py")
        for finding in findings:
            print(f"Unused: {finding.import_statement} at line {finding.line_number}")
    """

    # Imports that are commonly used for side effects or type checking
    KNOWN_SIDE_EFFECT_IMPORTS = {
        "typing", "typing_extensions", "__future__",
        "collections.abc", "abc",
    }

    def __init__(self, ignore_type_checking: bool = True):
        self.ignore_type_checking = ignore_type_checking

    def analyze_file(self, file_path: str) -> list[UnusedImport]:
        """Analyze a single Python file for unused imports."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                source = f.read()
            return self.analyze_source(source, file_path)
        except SyntaxError:
            return []
        except Exception:
            return []

    def analyze_source(self, source: str, file_path: str = "<string>") -> list[UnusedImport]:
        """Analyze Python source code string for unused imports."""
        try:
            tree = ast.parse(source, filename=file_path)
        except SyntaxError:
            return []

        # Collect all imports
        import_collector = _ImportCollector()
        import_collector.visit(tree)

        # Collect all name references (excluding imports)
        name_collector = _NameCollector()
        name_collector.visit(tree)

        # Check for __all__ definition
        all_names = self._extract_all_names(tree)

        # Find unused imports
        unused = []
        for imp in import_collector.imports:
            local_name = imp["local_name"]

            # Skip known side-effect imports
            if imp["module"] in self.KNOWN_SIDE_EFFECT_IMPORTS:
                continue

            # Skip if name is referenced in code
            if local_name in name_collector.names:
                continue

            # Skip if name is in __all__
            if all_names is not None and imp["name"] in all_names:
                continue

            # Skip if used in type comments (basic check)
            if self._is_used_in_comments(source, local_name):
                continue

            unused.append(UnusedImport(
                module=imp["module"],
                name=imp["name"],
                alias=imp["alias"],
                file_path=file_path,
                line_number=imp["line"],
                import_statement=imp["statement"],
            ))

        return unused

    def _extract_all_names(self, tree: ast.AST) -> Optional[set[str]]:
        """Extract names from __all__ if defined."""
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == "__all__":
                        if isinstance(node.value, (ast.List, ast.Tuple)):
                            names = set()
                            for elt in node.value.elts:
                                if isinstance(elt, ast.Constant) and isinstance(elt.value, str):
                                    names.add(elt.value)
                            return names
        return None

    def _is_used_in_comments(self, source: str, name: str) -> bool:
        """Check if a name appears in type comments (# type: ...)."""
        for line in source.splitlines():
            stripped = line.strip()
            if "# type:" in stripped and name in stripped:
                return True
            if "# noqa" in stripped and name in stripped:
                return True
        return False

    def analyze_directory(self, target_dir: str, exclude_dirs: list[str] = None) -> list[UnusedImport]:
        """Analyze all Python files in a directory."""
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
