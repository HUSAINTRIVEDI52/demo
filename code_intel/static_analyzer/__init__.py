"""
Static Analysis Module

Parses Python source code to build call graphs, detect unused imports,
and identify unreachable code.
"""

from .call_graph import CallGraphBuilder
from .unused_imports import UnusedImportDetector
from .unreachable_code import UnreachableCodeDetector

__all__ = ["CallGraphBuilder", "UnusedImportDetector", "UnreachableCodeDetector"]
