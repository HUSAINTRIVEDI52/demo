"""
Tracing Decorators

Provides convenient decorators for manually instrumenting functions and classes
with execution tracking.
"""

import functools
import time
import inspect
from typing import Optional

from .metrics_store import MetricsStore

# Global store reference — initialized by `configure()`
_global_store: Optional[MetricsStore] = None


def configure(storage_backend: str = "sqlite", db_path: str = "code_intel_metrics.db",
              prometheus_url: str = "http://localhost:9090"):
    """
    Configure the global metrics store for decorators.
    
    Call this once at application startup:
        from code_intel.runtime_tracer.decorators import configure
        configure(storage_backend="sqlite", db_path="metrics.db")
    """
    global _global_store
    _global_store = MetricsStore(
        backend=storage_backend,
        db_path=db_path,
        prometheus_url=prometheus_url,
    )


def _get_store() -> MetricsStore:
    """Get or create the global metrics store."""
    global _global_store
    if _global_store is None:
        _global_store = MetricsStore(backend="sqlite", db_path="code_intel_metrics.db")
    return _global_store


def trace_function(func=None, *, name: str = None):
    """
    Decorator to trace function execution.
    
    Usage:
        @trace_function
        def my_function():
            ...
        
        @trace_function(name="custom.name")
        def another_function():
            ...
    """
    def decorator(fn):
        qualified_name = name or _get_qualified_name(fn)

        if inspect.iscoroutinefunction(fn):
            @functools.wraps(fn)
            async def async_wrapper(*args, **kwargs):
                store = _get_store()
                start = time.time()
                error = None
                try:
                    return await fn(*args, **kwargs)
                except Exception as e:
                    error = str(e)
                    raise
                finally:
                    duration_ms = (time.time() - start) * 1000
                    store.record_execution(
                        function_name=qualified_name,
                        duration_ms=duration_ms,
                        success=error is None,
                    )
            return async_wrapper
        else:
            @functools.wraps(fn)
            def wrapper(*args, **kwargs):
                store = _get_store()
                start = time.time()
                error = None
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    error = str(e)
                    raise
                finally:
                    duration_ms = (time.time() - start) * 1000
                    store.record_execution(
                        function_name=qualified_name,
                        duration_ms=duration_ms,
                        success=error is None,
                    )
            return wrapper

    if func is not None:
        return decorator(func)
    return decorator


def trace_class(cls):
    """
    Class decorator that instruments all methods of a class.
    
    Usage:
        @trace_class
        class MyService:
            def process(self):
                ...
            
            async def fetch(self):
                ...
    """
    for attr_name in list(vars(cls)):
        if attr_name.startswith("_"):
            continue
        attr = getattr(cls, attr_name)
        if callable(attr):
            qualified = f"{cls.__module__}.{cls.__qualname__}.{attr_name}"
            wrapped = trace_function(attr, name=qualified)
            setattr(cls, attr_name, wrapped)
    return cls


def _get_qualified_name(func) -> str:
    """Build a fully qualified name for a function."""
    module = getattr(func, "__module__", "") or ""
    qualname = getattr(func, "__qualname__", "") or func.__name__
    if module:
        return f"{module}.{qualname}"
    return qualname
