"""
Runtime Tracer Module

Instruments Python functions using OpenTelemetry and decorators to track
execution frequency and duration at runtime.
"""

from .tracer import RuntimeTracer
from .decorators import trace_function, trace_class
from .metrics_store import MetricsStore

__all__ = ["RuntimeTracer", "trace_function", "trace_class", "MetricsStore"]
