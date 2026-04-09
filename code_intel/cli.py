"""
Code Usage Intelligence System — CLI Entry Point

Provides a command-line interface for running static analysis,
leak detection, correlation, and report generation.

Usage:
    code-intel analyze --target ./my_project
    code-intel scan-logs --target ./logs
    code-intel correlate --target ./my_project --runtime-db metrics.db
    code-intel report --input report.json --format html
    code-intel ci --target ./my_project --config config.yaml
"""

import argparse
import json
import os
import sys
import yaml
from datetime import datetime

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

from .static_analyzer import CallGraphBuilder, UnusedImportDetector, UnreachableCodeDetector
from .leak_detector import LogScanner
from .correlation.engine import CorrelationEngine
from .reporting import JSONReportGenerator, HTMLReportGenerator, PRCommentGenerator
from .runtime_tracer.metrics_store import MetricsStore


console = Console()


def load_config(config_path: str = "config.yaml") -> dict:
    """Load pipeline configuration."""
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            return yaml.safe_load(f) or {}
    return {}


def cmd_analyze(args):
    """Run static analysis on a target directory."""
    target = args.target
    config = load_config(args.config)
    static_config = config.get("static_analysis", {})

    exclude_dirs = static_config.get("exclude_dirs", ["venv", ".git", "__pycache__"])

    console.print(Panel(
        f"[bold cyan]Static Analysis[/bold cyan]\nTarget: {target}",
        title="🔍 Code Intelligence",
        border_style="cyan",
    ))

    # 1. Build call graph
    console.print("\n[bold]Building call graph...[/bold]")
    builder = CallGraphBuilder(exclude_dirs=exclude_dirs)
    builder.build(target)
    graph_data = builder.to_dict()

    console.print(f"  ✅ Functions: {graph_data['stats']['total_functions']}")
    console.print(f"  ✅ Classes: {graph_data['stats']['total_classes']}")
    console.print(f"  ✅ Endpoints: {graph_data['stats']['total_endpoints']}")
    console.print(f"  ⚠️  Orphan functions: {graph_data['stats']['orphan_functions']}")

    if graph_data["errors"]:
        console.print(f"  ❌ Parse errors: {len(graph_data['errors'])}")

    # 2. Detect unused imports
    console.print("\n[bold]Detecting unused imports...[/bold]")
    import_detector = UnusedImportDetector()
    unused = import_detector.analyze_directory(target, exclude_dirs=exclude_dirs)
    console.print(f"  {'⚠️' if unused else '✅'} Unused imports: {len(unused)}")

    if unused:
        table = Table(title="Unused Imports", show_lines=False)
        table.add_column("Import", style="yellow")
        table.add_column("File", style="dim")
        table.add_column("Line", style="dim")
        for imp in unused[:15]:
            table.add_row(imp.import_statement, os.path.basename(imp.file_path), str(imp.line_number))
        console.print(table)

    # 3. Detect unreachable code
    console.print("\n[bold]Detecting unreachable code...[/bold]")
    unreachable_detector = UnreachableCodeDetector()
    unreachable = unreachable_detector.analyze_directory(target, exclude_dirs=exclude_dirs)
    console.print(f"  {'⚠️' if unreachable else '✅'} Unreachable blocks: {len(unreachable)}")

    # Output summary
    console.print(Panel(
        f"Functions: {graph_data['stats']['total_functions']} | "
        f"Unused imports: {len(unused)} | "
        f"Unreachable: {len(unreachable)} | "
        f"Errors: {len(graph_data['errors'])}",
        title="📊 Static Analysis Summary",
        border_style="green",
    ))

    return {
        "call_graph": builder,
        "unused_imports": unused,
        "unreachable_code": unreachable,
    }


def cmd_scan_logs(args):
    """Scan logs and source code for sensitive data leaks."""
    target = args.target
    config = load_config(args.config)
    leak_config = config.get("leak_detection", {})

    console.print(Panel(
        f"[bold red]Leak Detection[/bold red]\nTarget: {target}",
        title="🔐 Leak Scanner",
        border_style="red",
    ))

    scanner = LogScanner(enabled_patterns=leak_config.get("patterns"))
    findings = []

    # Scan log files
    log_dir = os.path.join(target, "logs") if os.path.isdir(os.path.join(target, "logs")) else None
    if log_dir:
        console.print(f"\n[bold]Scanning log files in {log_dir}...[/bold]")
        log_result = scanner.scan_directory(log_dir)
        findings.extend(log_result.findings)
        console.print(f"  Files scanned: {log_result.files_scanned}")
        console.print(f"  Findings: {log_result.total_findings}")

    # Scan source code for risky patterns
    console.print(f"\n[bold]Scanning source code for risky patterns...[/bold]")
    static_config = config.get("static_analysis", {})
    exclude_dirs = static_config.get("exclude_dirs", ["venv", ".git", "__pycache__"])
    source_result = scanner.scan_source_directory(target, exclude_dirs=exclude_dirs)
    findings.extend(source_result.findings)
    console.print(f"  Files scanned: {source_result.files_scanned}")
    console.print(f"  Findings: {source_result.total_findings}")

    # Display findings by severity
    if findings:
        table = Table(title="Leak Findings", show_lines=False)
        table.add_column("Severity", style="bold")
        table.add_column("Pattern", style="yellow")
        table.add_column("Location", style="dim")
        table.add_column("Description")

        severity_colors = {
            "CRITICAL": "red",
            "HIGH": "dark_orange",
            "MEDIUM": "yellow",
            "LOW": "green",
        }

        for finding in sorted(findings, key=lambda f: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}.get(finding.severity.value, 4)):
            color = severity_colors.get(finding.severity.value, "white")
            table.add_row(
                f"[{color}]{finding.severity.value}[/{color}]",
                finding.pattern_name.replace("_", " ").title(),
                f"{os.path.basename(finding.file_path)}:{finding.line_number}",
                finding.description[:60],
            )
        console.print(table)

    console.print(Panel(
        f"Total findings: {len(findings)} | "
        f"Critical: {sum(1 for f in findings if f.severity.value == 'CRITICAL')} | "
        f"High: {sum(1 for f in findings if f.severity.value == 'HIGH')}",
        title="📊 Leak Detection Summary",
        border_style="red",
    ))

    return findings


def cmd_ci(args):
    """
    Combined CI mode: runs all analysis, generates reports, and
    exits with non-zero code if critical issues are found.
    """
    target = args.target
    config = load_config(args.config)

    console.print(Panel(
        "[bold magenta]CI/CD Pipeline Mode[/bold magenta]\n"
        f"Target: {target}\n"
        f"Config: {args.config}",
        title="🚀 Code Usage Intelligence System",
        border_style="magenta",
    ))

    # ── Static Analysis ──
    static_config = config.get("static_analysis", {})
    dead_config = config.get("dead_code", {})
    exclude_dirs = static_config.get("exclude_dirs", ["venv", ".git", "__pycache__"])
    time_window = dead_config.get("time_window_days", 30)

    console.print("\n[bold cyan]Phase 1: Static Analysis[/bold cyan]")
    builder = CallGraphBuilder(exclude_dirs=exclude_dirs)
    builder.build(target)
    stats = builder.to_dict()["stats"]
    console.print(f"  Functions: {stats['total_functions']} | Classes: {stats['total_classes']} | Endpoints: {stats['total_endpoints']}")

    import_detector = UnusedImportDetector()
    unused_imports = import_detector.analyze_directory(target, exclude_dirs=exclude_dirs)
    console.print(f"  Unused imports: {len(unused_imports)}")

    unreachable_detector = UnreachableCodeDetector()
    unreachable = unreachable_detector.analyze_directory(target, exclude_dirs=exclude_dirs)
    console.print(f"  Unreachable code blocks: {len(unreachable)}")

    # ── Leak Detection ──
    console.print("\n[bold red]Phase 2: Leak Detection[/bold red]")
    leak_config = config.get("leak_detection", {})
    scanner = LogScanner(enabled_patterns=leak_config.get("patterns"))

    leak_findings = []
    # Scan logs
    log_dir = os.path.join(target, "logs")
    if os.path.isdir(log_dir):
        log_result = scanner.scan_directory(log_dir)
        leak_findings.extend(log_result.findings)
        console.print(f"  Log files scanned: {log_result.files_scanned} | Findings: {log_result.total_findings}")

    # Scan source
    source_result = scanner.scan_source_directory(target, exclude_dirs=exclude_dirs)
    leak_findings.extend(source_result.findings)
    console.print(f"  Source files scanned: {source_result.files_scanned} | Findings: {source_result.total_findings}")

    # ── Runtime Metrics (if available) ──
    console.print("\n[bold green]Phase 3: Runtime Correlation[/bold green]")
    runtime_config = config.get("runtime", {})
    runtime_data = {}
    executed_functions = set()

    db_path = args.runtime_db or runtime_config.get("sqlite_path", "code_intel_metrics.db")
    if os.path.exists(db_path):
        console.print(f"  Loading runtime data from: {db_path}")
        store = MetricsStore(backend="sqlite", db_path=db_path)
        runtime_data = store.get_summary(days=time_window)
        executed_functions = store.get_executed_function_names(days=time_window)
        console.print(f"  Functions with runtime data: {len(executed_functions)}")
        store.close()
    else:
        console.print("  ⚠️  No runtime database found — using static analysis only")

    # ── Correlation ──
    console.print("\n[bold yellow]Phase 4: Correlation[/bold yellow]")
    engine = CorrelationEngine(
        time_window_days=time_window,
        exclude_patterns=dead_config.get("exclude_patterns", []),
    )
    engine.set_call_graph(builder)
    engine.set_runtime_data(runtime_data, executed_functions)
    engine.set_unused_imports(unused_imports)
    engine.set_unreachable_code(unreachable)
    engine.set_leak_results(leak_findings)

    report = engine.correlate(target_dir=target)
    console.print(f"  Dead code: {report.dead_code_count} ({report.dead_code_percentage:.1f}%)")
    console.print(f"  Correlated leaks: {len(report.leak_findings)}")

    # ── Report Generation ──
    console.print("\n[bold blue]Phase 5: Report Generation[/bold blue]")
    report_config = config.get("reporting", {})
    output_dir = report_config.get("output_dir", "reports")
    formats = report_config.get("formats", ["json", "html"])

    if "json" in formats:
        json_gen = JSONReportGenerator(output_dir=output_dir)
        json_path = json_gen.generate(report)
        console.print(f"  📄 JSON report: {json_path}")

    if "html" in formats:
        html_gen = HTMLReportGenerator(output_dir=output_dir)
        html_path = html_gen.generate(report)
        console.print(f"  🌐 HTML report: {html_path}")

    # PR Comment (if in GitHub Actions)
    if os.environ.get("GITHUB_ACTIONS"):
        pr_gen = PRCommentGenerator()
        md_path = pr_gen.save_markdown(report, os.path.join(output_dir, "pr_comment.md"))
        console.print(f"  💬 PR comment: {md_path}")

    # ── Final Verdict ──
    ci_config = config.get("ci", {})
    fail_on_critical = ci_config.get("fail_on_critical_leaks", True)
    fail_on_high = ci_config.get("fail_on_high_leaks", False)

    exit_code = 0

    if fail_on_critical and report.has_critical_issues:
        console.print(Panel(
            f"[bold red]BUILD FAILED[/bold red]\n"
            f"{len(report.critical_leaks)} critical leak(s) detected!",
            title="❌ CI Result",
            border_style="red",
        ))
        exit_code = 1
    elif fail_on_high and report.high_leaks:
        console.print(Panel(
            f"[bold red]BUILD FAILED[/bold red]\n"
            f"{len(report.high_leaks)} high-severity leak(s) detected!",
            title="❌ CI Result",
            border_style="red",
        ))
        exit_code = 1
    else:
        console.print(Panel(
            "[bold green]BUILD PASSED[/bold green]\n"
            f"Dead code: {report.dead_code_count} | Leaks: {len(report.leak_findings)} | "
            f"Unused imports: {len(report.unused_imports)}",
            title="✅ CI Result",
            border_style="green",
        ))

    return exit_code


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        prog="code-intel",
        description="Code Usage Intelligence System — Detect dead code and sensitive data leaks",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  code-intel analyze --target ./my_project
  code-intel scan-logs --target ./my_project
  code-intel ci --target ./my_project --config config.yaml
        """,
    )

    parser.add_argument("--config", default="config.yaml", help="Path to config file")

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # analyze
    analyze_parser = subparsers.add_parser("analyze", help="Run static analysis")
    analyze_parser.add_argument("--target", required=True, help="Target directory to analyze")

    # scan-logs
    scan_parser = subparsers.add_parser("scan-logs", help="Scan for sensitive data leaks")
    scan_parser.add_argument("--target", required=True, help="Target directory to scan")

    # correlate
    correlate_parser = subparsers.add_parser("correlate", help="Run correlation engine")
    correlate_parser.add_argument("--target", required=True, help="Target directory")
    correlate_parser.add_argument("--runtime-db", help="Path to runtime metrics SQLite database")

    # ci
    ci_parser = subparsers.add_parser("ci", help="Combined CI/CD mode")
    ci_parser.add_argument("--target", required=True, help="Target directory")
    ci_parser.add_argument("--runtime-db", help="Path to runtime metrics database")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "analyze":
        cmd_analyze(args)
    elif args.command == "scan-logs":
        cmd_scan_logs(args)
    elif args.command == "ci":
        exit_code = cmd_ci(args)
        sys.exit(exit_code)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
