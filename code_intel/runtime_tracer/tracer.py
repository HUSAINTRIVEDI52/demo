"""
OpenTelemetry-based Runtime Tracer

Sets up OpenTelemetry tracing to automatically instrument function calls
and record execution counts and durations.
"""

import time
import functools
import importlib
import inspect
from typing import Optional

from .metrics_store import MetricsStore


class RuntimeTracer:
    """
    Instruments Python modules to trace function execution at runtime.
    
    Uses OpenTelemetry for span creation and a MetricsStore backend
    (SQLite or Prometheus) for persisting execution metrics.
    
    Usage:
        tracer = RuntimeTracer(storage_backend="sqlite", db_path="metrics.db")
        tracer.instrument_module("my_app.handlers")
        tracer.instrument_function(my_function)
        
        # After running the app...
        metrics = tracer.get_execution_summary()
    """

    def __init__(self, storage_backend: str = "sqlite", db_path: str = "code_intel_metrics.db",
                 prometheus_url: str = "http://localhost:9090", service_name: str = "code-intel"):
        self.store = MetricsStore(
            backend=storage_backend,
            db_path=db_path,
            prometheus_url=prometheus_url,
        )
        self.service_name = service_name
        self._tracer = None
        self._instrumented: set[str] = set()

        self._setup_otel()

    def _setup_otel(self):
        """Initialize OpenTelemetry tracer provider."""
        try:
            from opentelemetry import trace
            from opentelemetry.sdk.trace import TracerProvider
            from opentelemetry.sdk.resources import Resource

            resource = Resource.create({"service.name": self.service_name})
            provider = TracerProvider(resource=resource)
            trace.set_tracer_provider(provider)
            self._tracer = trace.get_tracer("code-intel-tracer")
        except ImportError:
            # OpenTelemetry not installed, use fallback
            self._tracer = None

    def instrument_function(self, func):
        """
        Wrap a function with tracing instrumentation.
        
        Returns the wrapped function that records execution count and duration.
        """
        qualified_name = self._get_qualified_name(func)

        if qualified_name in self._instrumented:
            return func

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            error = None

            # Create OTel span if available
            span = None
            if self._tracer:
                span = self._tracer.start_span(qualified_name)

            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                error = str(e)
                raise
            finally:
                duration = time.time() - start_time

                if span:
                    if error:
                        span.set_attribute("error", True)
                        span.set_attribute("error.message", error)
                    span.set_attribute("duration_ms", duration * 1000)
                    span.end()

                # Record in metrics store
                self.store.record_execution(
                    function_name=qualified_name,
                    duration_ms=duration * 1000,
                    success=error is None,
                )

        # Mark async functions
        if inspect.iscoroutinefunction(func):
            @functools.wraps(func)
            async def async_wrapper(*args, **kwargs):
                start_time = time.time()
                error = None
                span = None

                if self._tracer:
                    span = self._tracer.start_span(qualified_name)

                try:
                    result = await func(*args, **kwargs)
                    return result
                except Exception as e:
                    error = str(e)
                    raise
                finally:
                    duration = time.time() - start_time
                    if span:
                        if error:
                            span.set_attribute("error", True)
                        span.end()
                    self.store.record_execution(
                        function_name=qualified_name,
                        duration_ms=duration * 1000,
                        success=error is None,
                    )

            self._instrumented.add(qualified_name)
            return async_wrapper

        self._instrumented.add(qualified_name)
        return wrapper

    def instrument_module(self, module_name: str) -> int:
        """
        Instrument all functions in a module.
        
        Returns the number of functions instrumented.
        """
        try:
            module = importlib.import_module(module_name)
        except ImportError:
            return 0

        count = 0
        for name, obj in inspect.getmembers(module):
            if inspect.isfunction(obj) and obj.__module__ == module_name:
                wrapped = self.instrument_function(obj)
                setattr(module, name, wrapped)
                count += 1

        return count

    def get_execution_summary(self, days: int = 30) -> dict[str, dict]:
        """
        Get execution metrics for all traced functions within the time window.
        
        Returns:
            {function_name: {count, avg_duration_ms, last_executed, error_count}}
        """
        return self.store.get_summary(days=days)

    def get_executed_functions(self, days: int = 30) -> set[str]:
        """Get set of function names that were executed in the last N days."""
        return self.store.get_executed_function_names(days=days)

    def _get_qualified_name(self, func) -> str:
        """Get the fully qualified name of a function."""
        module = getattr(func, "__module__", "") or ""
        qualname = getattr(func, "__qualname__", "") or func.__name__
        if module:
            return f"{module}.{qualname}"
        return qualname
