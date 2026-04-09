"""
Tree-sitter Parser

Parses JavaScript and TypeScript source files to extract functions, classes,
and execution calls, outputting them in a format compatible with our `FunctionInfo` models.
"""

import os
from typing import Optional

try:
    import tree_sitter
    import tree_sitter_javascript as tsjavascript
    import tree_sitter_typescript as tstypescript
    
    JS_LANGUAGE = tree_sitter.Language(tsjavascript.language())
    TS_LANGUAGE = tree_sitter.Language(tstypescript.language_typescript())
    TSX_LANGUAGE = tree_sitter.Language(tstypescript.language_tsx())
    
    HAS_TREE_SITTER = True
except ImportError:
    HAS_TREE_SITTER = False

from .call_graph import FunctionInfo, ClassInfo


class TreeSitterParser:
    """Parses JS/TS files using tree-sitter."""
    
    def __init__(self, file_path: str, base_dir: str):
        self.file_path = file_path
        self.base_dir = base_dir
        
        # Derive module name from file path
        rel_path = os.path.relpath(file_path, base_dir)
        self.module_name = rel_path.replace(os.sep, ".")
        
        # Select language based on extension
        ext = os.path.splitext(file_path)[1].lower()
        if ext in (".ts",):
            self.language = TS_LANGUAGE
        elif ext in (".tsx",):
            self.language = TSX_LANGUAGE
        else:
            self.language = JS_LANGUAGE
            
        self.parser = tree_sitter.Parser(self.language)
        
        self.functions: dict[str, FunctionInfo] = {}
        self.classes: dict[str, ClassInfo] = {}
        
        self.source_bytes = b""
        self.source_lines = []

    def parse(self, source: str):
        """Parse source code string."""
        if not HAS_TREE_SITTER:
            raise RuntimeError("tree-sitter is perfectly required but not installed.")
            
        self.source_bytes = source.encode('utf8', errors='replace')
        self.source_lines = source.splitlines()
        
        tree = self.parser.parse(self.source_bytes)
        
        self._traverse(tree.root_node, class_context=None)
        
    def _get_text(self, node) -> str:
        """Extract text from a syntax node."""
        if not node:
            return ""
        return self.source_bytes[node.start_byte:node.end_byte].decode('utf8', errors='ignore')

    def _traverse(self, node, class_context: Optional[str] = None):
        if node.type == "class_declaration":
            self._handle_class(node)
        elif node.type in ("function_declaration", "arrow_function", "method_definition"):
            self._handle_function(node, class_context)
        elif node.type == "lexical_declaration" or node.type == "variable_declaration":
            self._handle_variable_declaration(node, class_context)
        else:
            for child in node.children:
                self._traverse(child, class_context)

    def _handle_class(self, node):
        name_node = node.child_by_field_name("name")
        if not name_node:
            for child in node.children:
                self._traverse(child)
            return

        name = self._get_text(name_node)
        qualified = f"{self.module_name}.{name}"
        
        start_line = node.start_point[0] + 1
        end_line = node.end_point[0] + 1
        
        class_info = ClassInfo(
            name=name,
            qualified_name=qualified,
            file_path=self.file_path,
            line_number=start_line,
            end_line=end_line,
        )
        self.classes[qualified] = class_info
        
        # Look for methods inside the class body
        body_node = node.child_by_field_name("body")
        if body_node:
            for child in body_node.children:
                self._traverse(child, class_context=qualified)
                
        # Register methods to class
        class_info.methods = [
            fn.qualified_name for fn in self.functions.values()
            if fn.qualified_name.startswith(qualified + ".")
        ]

    def _handle_variable_declaration(self, node, class_context: Optional[str]):
        """Handle const fn = () => {}"""
        for child in node.children:
            if child.type == "variable_declarator":
                name_node = child.child_by_field_name("name")
                value_node = child.child_by_field_name("value")
                if name_node and value_node and value_node.type == "arrow_function":
                    self._handle_function(value_node, class_context, assigned_name=self._get_text(name_node))
            else:
                self._traverse(child, class_context)

    def _handle_function(self, node, class_context: Optional[str], assigned_name: str = None):
        name = assigned_name
        if not name:
            name_node = node.child_by_field_name("name")
            if name_node:
                name = self._get_text(name_node)
            else:
                name = "anonymous"

        is_method = class_context is not None
        if class_context:
            qualified = f"{class_context}.{name}"
        else:
            qualified = f"{self.module_name}.{name}"

        start_line = node.start_point[0] + 1
        end_line = node.end_point[0] + 1

        is_async = False
        for child in node.children:
            if child.type == "async":
                is_async = True
                break

        # Collect calls within this function
        calls = self._extract_calls(node)

        # Basic complexity calculation (count if, for, while, catch)
        complexity = 1 + sum(1 for n in self._walk(node) if n.type in ("if_statement", "for_statement", "while_statement", "catch_clause", "ternary_expression"))

        # We don't thoroughly extract JS decorators or endpoints in this generic implementation yet,
        # but could expand it to look for Express app.get equivalents.
        is_endpoint = False
        
        # Express.js endpoint detection heuristic: 
        # Check if call is app.get or router.post
        # We actually do this via checking if the assigned context matches.
        
        func_info = FunctionInfo(
            name=name,
            qualified_name=qualified,
            file_path=self.file_path,
            line_number=start_line,
            end_line=end_line,
            is_method=is_method,
            is_async=is_async,
            is_endpoint=is_endpoint,
            calls=calls,
            complexity=complexity,
        )
        
        self.functions[qualified] = func_info
        
        # Traverse body for nested functions
        body_node = node.child_by_field_name("body")
        if body_node:
            for child in body_node.children:
                self._traverse(child, class_context=qualified)

    def _extract_calls(self, root_node) -> list[str]:
        calls = []
        for node in self._walk(root_node):
            if node.type == "call_expression":
                func_node = node.child_by_field_name("function")
                if func_node:
                    if func_node.type == "identifier":
                        calls.append(self._get_text(func_node))
                    elif func_node.type == "member_expression":
                        # e.g., obj.method
                        obj_node = func_node.child_by_field_name("object")
                        prop_node = func_node.child_by_field_name("property")
                        if obj_node and prop_node:
                            # A simple text representation.
                            calls.append(self._get_text(func_node))
        return list(set(calls))

    def _walk(self, node):
        yield node
        for child in node.children:
            yield from self._walk(child)

