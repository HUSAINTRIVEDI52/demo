"""
Call Graph Builder

Uses Python's ast module to parse source files and build a directed call graph
of all functions, classes, methods, and API endpoints.
"""

import ast
import os
from dataclasses import dataclass, field
from typing import Optional




@dataclass
class FunctionInfo:
    """Represents a discovered function/method in the codebase."""
    name: str
    qualified_name: str
    file_path: str
    line_number: int
    end_line: int
    is_method: bool = False
    is_async: bool = False
    is_endpoint: bool = False
    endpoint_route: Optional[str] = None
    endpoint_methods: list = field(default_factory=list)
    calls: list = field(default_factory=list)
    called_by: list = field(default_factory=list)
    decorators: list = field(default_factory=list)
    docstring: Optional[str] = None
    complexity: int = 0


@dataclass
class ClassInfo:
    """Represents a discovered class in the codebase."""
    name: str
    qualified_name: str
    file_path: str
    line_number: int
    end_line: int
    methods: list = field(default_factory=list)
    bases: list = field(default_factory=list)
    decorators: list = field(default_factory=list)


class _CallVisitor(ast.NodeVisitor):
    """AST visitor that collects function calls within a function body."""

    def __init__(self):
        self.calls = []

    def visit_Call(self, node: ast.Call):
        call_name = self._resolve_call_name(node.func)
        if call_name:
            self.calls.append(call_name)
        self.generic_visit(node)

    def _resolve_call_name(self, node) -> Optional[str]:
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            value_name = self._resolve_call_name(node.value)
            if value_name:
                return f"{value_name}.{node.attr}"
            return node.attr
        return None


class _FunctionVisitor(ast.NodeVisitor):
    """AST visitor that discovers functions, classes, and API endpoints."""

    # Known web framework route decorators
    ROUTE_DECORATORS = {
        "route", "get", "post", "put", "delete", "patch",
        "api_view", "action", "app.route", "app.get", "app.post",
        "app.put", "app.delete", "app.patch",
        "router.get", "router.post", "router.put", "router.delete",
    }

    def __init__(self, file_path: str, module_name: str):
        self.file_path = file_path
        self.module_name = module_name
        self.functions: dict[str, FunctionInfo] = {}
        self.classes: dict[str, ClassInfo] = {}
        self._class_stack: list[str] = []

    def visit_ClassDef(self, node: ast.ClassDef):
        qualified = f"{self.module_name}.{node.name}"
        if self._class_stack:
            qualified = f"{self._class_stack[-1]}.{node.name}"

        class_info = ClassInfo(
            name=node.name,
            qualified_name=qualified,
            file_path=self.file_path,
            line_number=node.lineno,
            end_line=node.end_lineno or node.lineno,
            bases=[self._get_name(b) for b in node.bases],
            decorators=[self._get_decorator_name(d) for d in node.decorator_list],
        )

        self._class_stack.append(qualified)
        self.generic_visit(node)
        self._class_stack.pop()

        class_info.methods = [
            fn.qualified_name for fn in self.functions.values()
            if fn.qualified_name.startswith(qualified + ".")
        ]
        self.classes[qualified] = class_info

    def visit_FunctionDef(self, node: ast.FunctionDef):
        self._process_function(node, is_async=False)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self._process_function(node, is_async=True)

    def _process_function(self, node, is_async: bool):
        if self._class_stack:
            qualified = f"{self._class_stack[-1]}.{node.name}"
            is_method = True
        else:
            qualified = f"{self.module_name}.{node.name}"
            is_method = False

        # Extract decorators
        decorators = [self._get_decorator_name(d) for d in node.decorator_list]

        # Check for API endpoint decorators
        is_endpoint = False
        endpoint_route = None
        endpoint_methods = []
        for dec in node.decorator_list:
            dec_info = self._parse_route_decorator(dec)
            if dec_info:
                is_endpoint = True
                endpoint_route = dec_info.get("route")
                endpoint_methods = dec_info.get("methods", [])
                break

        # Extract calls made within this function
        call_visitor = _CallVisitor()
        call_visitor.visit(node)

        # Calculate cyclomatic complexity
        complexity = self._calculate_complexity(node)

        # Get docstring
        docstring = ast.get_docstring(node)

        func_info = FunctionInfo(
            name=node.name,
            qualified_name=qualified,
            file_path=self.file_path,
            line_number=node.lineno,
            end_line=node.end_lineno or node.lineno,
            is_method=is_method,
            is_async=is_async,
            is_endpoint=is_endpoint,
            endpoint_route=endpoint_route,
            endpoint_methods=endpoint_methods,
            calls=call_visitor.calls,
            decorators=decorators,
            docstring=docstring,
            complexity=complexity,
        )

        self.functions[qualified] = func_info
        self.generic_visit(node)

    def _parse_route_decorator(self, node) -> Optional[dict]:
        dec_name = self._get_decorator_name(node)
        if not dec_name:
            return None

        # Check if the decorator matches any known route patterns
        is_route = any(
            dec_name == rd or dec_name.endswith(f".{rd}")
            for rd in self.ROUTE_DECORATORS
        )
        if not is_route:
            return None

        route = None
        methods = []

        if isinstance(node, ast.Call):
            # Extract route path from first argument
            if node.args and isinstance(node.args[0], ast.Constant):
                route = node.args[0].value
            # Extract methods from keyword arguments
            for kw in node.keywords:
                if kw.arg == "methods" and isinstance(kw.value, ast.List):
                    methods = [
                        elt.value for elt in kw.value.elts
                        if isinstance(elt, ast.Constant)
                    ]
            # Infer method from decorator name
            if not methods:
                for m in ["get", "post", "put", "delete", "patch"]:
                    if dec_name.endswith(f".{m}") or dec_name == m:
                        methods = [m.upper()]
                        break
                if not methods:
                    methods = ["GET"]

        return {"route": route, "methods": methods}

    def _get_decorator_name(self, node) -> Optional[str]:
        if isinstance(node, ast.Call):
            return self._get_name(node.func)
        return self._get_name(node)

    def _get_name(self, node) -> Optional[str]:
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            value = self._get_name(node.value)
            if value:
                return f"{value}.{node.attr}"
            return node.attr
        elif isinstance(node, ast.Constant):
            return str(node.value)
        return None

    def _calculate_complexity(self, node) -> int:
        """Calculate cyclomatic complexity of a function."""
        complexity = 1  # Base complexity
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For,
                                  ast.ExceptHandler, ast.With)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
            elif isinstance(child, ast.Assert):
                complexity += 1
        return complexity


class CallGraphBuilder:
    """
    Builds a call graph from a Python codebase.
    
    Usage:
        builder = CallGraphBuilder(exclude_dirs=["venv", ".git"])
        graph = builder.build("path/to/project")
        
        # Access results
        for name, func in graph.functions.items():
            print(f"{name}: calls {func.calls}, called by {func.called_by}")
    """

    def __init__(self, exclude_dirs: list[str] = None, file_extensions: list[str] = None):
        self.exclude_dirs = set(exclude_dirs or ["venv", ".venv", ".git", "__pycache__", "node_modules"])
        self.file_extensions = set(file_extensions or [".py", ".js", ".jsx", ".ts", ".tsx"])
        self.functions: dict[str, FunctionInfo] = {}
        self.classes: dict[str, ClassInfo] = {}
        self.errors: list[dict] = []

    def build(self, target_dir: str) -> "CallGraphBuilder":
        """Parse all Python files in the target directory and build the call graph."""
        self.functions.clear()
        self.classes.clear()
        self.errors.clear()

        python_files = self._collect_files(target_dir)

        for file_path in python_files:
            self._parse_file(file_path, target_dir)

        # Resolve called_by relationships
        self._resolve_call_edges()

        return self

    def _collect_files(self, target_dir: str) -> list[str]:
        """Recursively collect all Python files, excluding configured directories."""
        files = []
        for root, dirs, filenames in os.walk(target_dir):
            # Filter out excluded directories (modifies in-place to prevent descent)
            dirs[:] = [
                d for d in dirs
                if d not in self.exclude_dirs and not d.startswith(".")
            ]
            for filename in filenames:
                if any(filename.endswith(ext) for ext in self.file_extensions):
                    files.append(os.path.join(root, filename))
        return files

    def _parse_file(self, file_path: str, base_dir: str):
        """Parse a single file using the appropriate parser."""
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == ".py":
            self._parse_python_file(file_path, base_dir)
        elif ext in (".js", ".jsx", ".ts", ".tsx"):
            self._parse_js_ts_file(file_path, base_dir)

    def _parse_python_file(self, file_path: str, base_dir: str):
        """Parse a Python file and extract functions/classes."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                source = f.read()

            tree = ast.parse(source, filename=file_path)

            # Derive module name from file path
            rel_path = os.path.relpath(file_path, base_dir)
            module_name = rel_path.replace(os.sep, ".").removesuffix(".py")
            if module_name.endswith(".__init__"):
                module_name = module_name.removesuffix(".__init__")

            visitor = _FunctionVisitor(file_path, module_name)
            visitor.visit(tree)

            self.functions.update(visitor.functions)
            self.classes.update(visitor.classes)

        except SyntaxError as e:
            self.errors.append({
                "file": file_path,
                "error": f"SyntaxError: {e.msg} at line {e.lineno}",
            })
        except Exception as e:
            self.errors.append({
                "file": file_path,
                "error": str(e),
            })

    def _parse_js_ts_file(self, file_path: str, base_dir: str):
        """Parse a JS/TS file using tree-sitter."""
        from .tree_sitter_parser import TreeSitterParser, HAS_TREE_SITTER
        if not HAS_TREE_SITTER:
            self.errors.append({
                "file": file_path,
                "error": "Skipped JS/TS file because tree-sitter is not installed.",
            })
            return
            
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                source = f.read()
                
            parser = TreeSitterParser(file_path, base_dir)
            parser.parse(source)
            
            self.functions.update(parser.functions)
            self.classes.update(parser.classes)
            
        except Exception as e:
            self.errors.append({
                "file": file_path,
                "error": str(e),
            })

    def _resolve_call_edges(self):
        """Resolve called_by relationships by cross-referencing calls."""
        # Build a lookup of simple names -> qualified names
        name_lookup: dict[str, list[str]] = {}
        for qualified_name, func in self.functions.items():
            simple_name = func.name
            name_lookup.setdefault(simple_name, []).append(qualified_name)

        # For each function, resolve its calls to qualified names and set called_by
        for caller_qn, caller_func in self.functions.items():
            resolved_calls = []
            for call_name in caller_func.calls:
                # Try exact match first
                if call_name in self.functions:
                    resolved_calls.append(call_name)
                    self.functions[call_name].called_by.append(caller_qn)
                # Try simple name lookup
                elif call_name in name_lookup:
                    for target_qn in name_lookup[call_name]:
                        resolved_calls.append(target_qn)
                        self.functions[target_qn].called_by.append(caller_qn)
                # Try matching method calls (e.g., self.method_name)
                elif "." in call_name:
                    method_name = call_name.split(".")[-1]
                    if method_name in name_lookup:
                        for target_qn in name_lookup[method_name]:
                            if self.functions[target_qn].is_method:
                                resolved_calls.append(target_qn)
                                self.functions[target_qn].called_by.append(caller_qn)

            caller_func.calls = resolved_calls

    def get_orphan_functions(self) -> list[FunctionInfo]:
        """Get functions that are never called by any other function."""
        return [
            func for func in self.functions.values()
            if not func.called_by
            and not func.is_endpoint
            and func.name not in ("main", "__init__", "__str__", "__repr__",
                                   "__eq__", "__hash__", "__len__", "__iter__")
            and not any(d for d in func.decorators if d and ("property" in d or "staticmethod" in d or "classmethod" in d))
        ]

    def get_endpoints(self) -> list[FunctionInfo]:
        """Get all discovered API endpoints."""
        return [func for func in self.functions.values() if func.is_endpoint]

    def to_dict(self) -> dict:
        """Export the call graph as a serializable dictionary."""
        return {
            "functions": {
                name: {
                    "name": func.name,
                    "qualified_name": func.qualified_name,
                    "file": func.file_path,
                    "line": func.line_number,
                    "end_line": func.end_line,
                    "is_method": func.is_method,
                    "is_async": func.is_async,
                    "is_endpoint": func.is_endpoint,
                    "endpoint_route": func.endpoint_route,
                    "calls": func.calls,
                    "called_by": func.called_by,
                    "decorators": func.decorators,
                    "complexity": func.complexity,
                }
                for name, func in self.functions.items()
            },
            "classes": {
                name: {
                    "name": cls.name,
                    "qualified_name": cls.qualified_name,
                    "file": cls.file_path,
                    "line": cls.line_number,
                    "methods": cls.methods,
                    "bases": cls.bases,
                }
                for name, cls in self.classes.items()
            },
            "errors": self.errors,
            "stats": {
                "total_functions": len(self.functions),
                "total_classes": len(self.classes),
                "total_endpoints": len(self.get_endpoints()),
                "orphan_functions": len(self.get_orphan_functions()),
                "parse_errors": len(self.errors),
            },
        }
