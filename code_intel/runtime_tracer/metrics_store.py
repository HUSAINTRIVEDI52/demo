"""
Metrics Store

Provides a unified interface for storing and querying function execution metrics.
Supports SQLite (for local/CI) and Prometheus (for production) backends.
"""

import sqlite3
import time
import os
from datetime import datetime, timedelta
from typing import Optional


class MetricsStore:
    """
    Unified metrics storage with SQLite and Prometheus backends.
    
    SQLite is the default for local development and CI pipelines.
    Prometheus can be used in production for long-term metrics.
    
    Usage:
        store = MetricsStore(backend="sqlite", db_path="metrics.db")
        store.record_execution("my_module.my_func", duration_ms=42.5, success=True)
        summary = store.get_summary(days=30)
    """

    def __init__(self, backend: str = "sqlite", db_path: str = "code_intel_metrics.db",
                 prometheus_url: str = "http://localhost:9090"):
        self.backend = backend
        self.db_path = db_path
        self.prometheus_url = prometheus_url
        self._conn: Optional[sqlite3.Connection] = None

        if self.backend == "sqlite":
            self._init_sqlite()

    def _init_sqlite(self):
        """Initialize SQLite database with schema."""
        self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._conn.execute("PRAGMA journal_mode=WAL")
        self._conn.execute("""
            CREATE TABLE IF NOT EXISTS executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                function_name TEXT NOT NULL,
                timestamp REAL NOT NULL,
                duration_ms REAL NOT NULL,
                success BOOLEAN NOT NULL DEFAULT 1,
                metadata TEXT
            )
        """)
        self._conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_executions_function 
            ON executions(function_name)
        """)
        self._conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_executions_timestamp 
            ON executions(timestamp)
        """)
        self._conn.execute("""
            CREATE TABLE IF NOT EXISTS function_summary (
                function_name TEXT PRIMARY KEY,
                total_count INTEGER DEFAULT 0,
                error_count INTEGER DEFAULT 0,
                total_duration_ms REAL DEFAULT 0,
                last_executed REAL,
                first_executed REAL
            )
        """)
        self._conn.commit()

    def record_execution(self, function_name: str, duration_ms: float,
                         success: bool = True, metadata: str = None):
        """Record a single function execution."""
        if self.backend == "sqlite":
            self._record_sqlite(function_name, duration_ms, success, metadata)
        elif self.backend == "prometheus":
            self._record_prometheus(function_name, duration_ms, success)

    def _record_sqlite(self, function_name: str, duration_ms: float,
                       success: bool, metadata: str = None):
        """Record execution in SQLite."""
        now = time.time()
        cursor = self._conn.cursor()

        # Insert execution record
        cursor.execute(
            "INSERT INTO executions (function_name, timestamp, duration_ms, success, metadata) "
            "VALUES (?, ?, ?, ?, ?)",
            (function_name, now, duration_ms, success, metadata)
        )

        # Update summary
        cursor.execute(
            """INSERT INTO function_summary (function_name, total_count, error_count, 
               total_duration_ms, last_executed, first_executed)
               VALUES (?, 1, ?, ?, ?, ?)
               ON CONFLICT(function_name) DO UPDATE SET
                   total_count = total_count + 1,
                   error_count = error_count + ?,
                   total_duration_ms = total_duration_ms + ?,
                   last_executed = ?""",
            (function_name, 0 if success else 1, duration_ms, now, now,
             0 if success else 1, duration_ms, now)
        )

        self._conn.commit()

    def _record_prometheus(self, function_name: str, duration_ms: float, success: bool):
        """Record execution in Prometheus via push gateway or exporter."""
        try:
            from prometheus_client import Counter, Histogram, push_to_gateway, CollectorRegistry

            registry = CollectorRegistry()

            exec_counter = Counter(
                'code_intel_function_executions_total',
                'Total function executions',
                ['function_name', 'status'],
                registry=registry,
            )
            duration_histogram = Histogram(
                'code_intel_function_duration_ms',
                'Function execution duration in milliseconds',
                ['function_name'],
                registry=registry,
            )

            status = "success" if success else "error"
            exec_counter.labels(function_name=function_name, status=status).inc()
            duration_histogram.labels(function_name=function_name).observe(duration_ms)

        except ImportError:
            pass  # Prometheus client not installed, silently skip

    def get_summary(self, days: int = 30) -> dict[str, dict]:
        """
        Get execution summary for all functions within the time window.
        
        Returns:
            {function_name: {count, avg_duration_ms, last_executed, error_count, first_executed}}
        """
        if self.backend == "sqlite":
            return self._get_summary_sqlite(days)
        elif self.backend == "prometheus":
            return self._get_summary_prometheus(days)
        return {}

    def _get_summary_sqlite(self, days: int) -> dict[str, dict]:
        """Query SQLite for execution summary."""
        cutoff = time.time() - (days * 86400)
        cursor = self._conn.cursor()

        cursor.execute("""
            SELECT 
                function_name,
                COUNT(*) as exec_count,
                AVG(duration_ms) as avg_duration,
                MAX(timestamp) as last_exec,
                MIN(timestamp) as first_exec,
                SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as errors
            FROM executions
            WHERE timestamp >= ?
            GROUP BY function_name
            ORDER BY exec_count DESC
        """, (cutoff,))

        results = {}
        for row in cursor.fetchall():
            results[row[0]] = {
                "count": row[1],
                "avg_duration_ms": round(row[2], 2),
                "last_executed": datetime.fromtimestamp(row[3]).isoformat(),
                "first_executed": datetime.fromtimestamp(row[4]).isoformat(),
                "error_count": row[5],
            }

        return results

    def _get_summary_prometheus(self, days: int) -> dict[str, dict]:
        """Query Prometheus for execution metrics."""
        try:
            import requests

            # Query total executions per function in the time range
            query = f'sum by (function_name) (increase(code_intel_function_executions_total[{days}d]))'
            response = requests.get(
                f"{self.prometheus_url}/api/v1/query",
                params={"query": query},
                timeout=10,
            )
            data = response.json()

            results = {}
            if data.get("status") == "success":
                for result in data.get("data", {}).get("result", []):
                    func_name = result["metric"].get("function_name", "unknown")
                    count = float(result["value"][1])
                    results[func_name] = {
                        "count": int(count),
                        "avg_duration_ms": 0,  # Would need separate query
                        "last_executed": "",
                        "error_count": 0,
                    }

            return results
        except Exception:
            return {}

    def get_executed_function_names(self, days: int = 30) -> set[str]:
        """Get the set of function names executed within the time window."""
        summary = self.get_summary(days=days)
        return set(summary.keys())

    def get_execution_count(self, function_name: str, days: int = 30) -> int:
        """Get the execution count for a specific function."""
        summary = self.get_summary(days=days)
        return summary.get(function_name, {}).get("count", 0)

    def clear(self):
        """Clear all stored metrics (useful for testing)."""
        if self.backend == "sqlite" and self._conn:
            self._conn.execute("DELETE FROM executions")
            self._conn.execute("DELETE FROM function_summary")
            self._conn.commit()

    def close(self):
        """Close the database connection."""
        if self._conn:
            self._conn.close()
            self._conn = None

    def __del__(self):
        self.close()
