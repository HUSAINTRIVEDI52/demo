"""
HTML Report Generator

Generates a premium HTML dashboard report from intelligence data,
using an inline template (no external dependencies required).
"""

import os
from datetime import datetime

from ..correlation.engine import IntelligenceReport


class HTMLReportGenerator:
    """
    Generates a rich HTML report with dashboard-style visualization.
    
    Usage:
        generator = HTMLReportGenerator(output_dir="reports")
        path = generator.generate(report)
    """

    def __init__(self, output_dir: str = "reports"):
        self.output_dir = output_dir

    def generate(self, report: IntelligenceReport,
                 filename: str = None) -> str:
        """Generate an HTML report file. Returns the path."""
        os.makedirs(self.output_dir, exist_ok=True)

        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"code_intel_report_{timestamp}.html"

        filepath = os.path.join(self.output_dir, filename)
        html = self._render(report)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)

        return filepath

    def _render(self, report: IntelligenceReport) -> str:
        """Render the HTML report using inline template."""
        data = report.to_dict()
        summary = data["summary"]

        # Build dead code rows
        dead_code_rows = ""
        for item in data["dead_code"]:
            confidence_class = {
                "high": "badge-critical",
                "medium": "badge-high",
                "low": "badge-medium",
            }.get(item["confidence"], "badge-low")

            dead_code_rows += f"""
            <tr>
                <td><code>{self._escape(item['qualified_name'])}</code></td>
                <td>{self._escape(item['file'])}:{item['line']}</td>
                <td>{item['reason'].replace('_', ' ').title()}</td>
                <td><span class="badge {confidence_class}">{item['confidence'].upper()}</span></td>
                <td>{'🌐 Yes' if item.get('is_endpoint') else '—'}</td>
            </tr>"""

        # Build unused import rows
        unused_imports_rows = ""
        for item in data["unused_imports"]:
            unused_imports_rows += f"""
            <tr>
                <td><code>{self._escape(item['import_statement'])}</code></td>
                <td>{self._escape(item['file'])}:{item['line']}</td>
            </tr>"""

        # Build leak rows
        leak_rows = ""
        for item in data["leak_findings"]:
            sev_class = f"badge-{item['severity'].lower()}"
            leak_rows += f"""
            <tr>
                <td>{self._escape(item['pattern_name']).replace('_', ' ').title()}</td>
                <td><span class="badge {sev_class}">{item['severity']}</span></td>
                <td><code>{self._escape(item.get('redacted_match', 'N/A'))}</code></td>
                <td>{self._escape(item['file'])}:{item['line']}</td>
                <td>{self._escape(item['category'])}</td>
                <td>{self._escape(item.get('source_function', '') or '—')}</td>
            </tr>"""

        # Build unreachable code rows
        unreachable_rows = ""
        for item in data["unreachable_code"]:
            unreachable_rows += f"""
            <tr>
                <td>{self._escape(item['file'])}:{item['line']}</td>
                <td>{item['type'].replace('_', ' ').title()}</td>
                <td>{self._escape(item['description'])}</td>
                <td><pre>{self._escape(item.get('snippet', ''))}</pre></td>
            </tr>"""

        status_class = "status-fail" if summary["has_critical_issues"] else "status-pass"
        status_text = "CRITICAL ISSUES FOUND" if summary["has_critical_issues"] else "PASS"

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Code Intelligence Report</title>
<style>
  :root {{
    --bg: #0f172a;
    --surface: #1e293b;
    --surface-2: #334155;
    --border: #475569;
    --text: #e2e8f0;
    --text-muted: #94a3b8;
    --accent: #38bdf8;
    --critical: #ef4444;
    --high: #f97316;
    --medium: #eab308;
    --low: #22c55e;
    --info: #6366f1;
    --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    --gradient-4: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    min-height: 100vh;
  }}
  .container {{ max-width: 1400px; margin: 0 auto; padding: 2rem; }}
  
  /* Header */
  .header {{
    text-align: center;
    padding: 2rem 0 3rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 2rem;
  }}
  .header h1 {{
    font-size: 2.2rem;
    background: var(--gradient-3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }}
  .header .meta {{
    color: var(--text-muted);
    font-size: 0.9rem;
  }}
  .status-badge {{
    display: inline-block;
    padding: 0.4rem 1.2rem;
    border-radius: 2rem;
    font-weight: 700;
    font-size: 0.85rem;
    margin-top: 1rem;
    letter-spacing: 0.05em;
  }}
  .status-pass {{ background: rgba(34,197,94,0.15); color: var(--low); border: 1px solid rgba(34,197,94,0.3); }}
  .status-fail {{ background: rgba(239,68,68,0.15); color: var(--critical); border: 1px solid rgba(239,68,68,0.3); animation: pulse 2s infinite; }}
  @keyframes pulse {{ 0%,100% {{ opacity: 1; }} 50% {{ opacity: 0.7; }} }}

  /* Summary Cards */
  .cards {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 2.5rem; }}
  .card {{
    background: var(--surface);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }}
  .card::before {{
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }}
  .card:nth-child(1)::before {{ background: var(--gradient-1); }}
  .card:nth-child(2)::before {{ background: var(--gradient-2); }}
  .card:nth-child(3)::before {{ background: var(--gradient-3); }}
  .card:nth-child(4)::before {{ background: var(--gradient-4); }}
  .card:nth-child(5)::before {{ background: var(--gradient-1); }}
  .card:nth-child(6)::before {{ background: var(--gradient-2); }}
  .card .card-value {{ font-size: 2rem; font-weight: 700; }}
  .card .card-label {{ color: var(--text-muted); font-size: 0.85rem; margin-top: 0.3rem; }}

  /* Section */
  .section {{
    background: var(--surface);
    border-radius: 12px;
    margin-bottom: 1.5rem;
    border: 1px solid var(--border);
    overflow: hidden;
  }}
  .section-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 1.5rem;
    background: var(--surface-2);
    cursor: pointer;
    user-select: none;
  }}
  .section-header h2 {{ font-size: 1.1rem; }}
  .section-header .count {{ 
    background: rgba(56,189,248,0.1);
    color: var(--accent);
    padding: 0.2rem 0.8rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 600;
  }}
  .section-body {{ padding: 1.5rem; }}

  /* Table */
  table {{ width: 100%; border-collapse: collapse; font-size: 0.85rem; }}
  th {{ text-align: left; padding: 0.8rem; background: var(--surface-2); color: var(--text-muted); 
        font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }}
  td {{ padding: 0.7rem 0.8rem; border-bottom: 1px solid var(--border); vertical-align: top; }}
  tr:hover td {{ background: rgba(56,189,248,0.03); }}
  code {{ background: var(--surface-2); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.8rem; }}
  pre {{ background: var(--surface-2); padding: 0.5rem; border-radius: 6px; overflow-x: auto; font-size: 0.8rem; max-height: 100px; }}

  /* Badges */
  .badge {{
    display: inline-block;
    padding: 0.15rem 0.6rem;
    border-radius: 1rem;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }}
  .badge-critical {{ background: rgba(239,68,68,0.15); color: var(--critical); }}
  .badge-high {{ background: rgba(249,115,22,0.15); color: var(--high); }}
  .badge-medium {{ background: rgba(234,179,8,0.15); color: var(--medium); }}
  .badge-low {{ background: rgba(34,197,94,0.15); color: var(--low); }}
  .badge-info {{ background: rgba(99,102,241,0.15); color: var(--info); }}

  .empty {{ text-align: center; padding: 2rem; color: var(--text-muted); }}
  
  /* Footer */
  .footer {{ text-align: center; padding: 2rem 0; color: var(--text-muted); font-size: 0.8rem; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🔍 Code Usage Intelligence Report</h1>
    <div class="meta">
      Generated: {data['metadata']['timestamp']}<br>
      Target: <code>{self._escape(data['metadata']['target_dir'])}</code> &nbsp;|&nbsp;
      Time Window: {data['metadata']['time_window_days']} days
    </div>
    <div class="status-badge {status_class}">{status_text}</div>
  </div>

  <div class="cards">
    <div class="card">
      <div class="card-value">{summary['total_functions']}</div>
      <div class="card-label">Total Functions</div>
    </div>
    <div class="card">
      <div class="card-value" style="color: var(--high)">{summary['dead_code_count']}</div>
      <div class="card-label">Dead Code ({summary['dead_code_percentage']}%)</div>
    </div>
    <div class="card">
      <div class="card-value" style="color: var(--medium)">{summary['unused_imports_count']}</div>
      <div class="card-label">Unused Imports</div>
    </div>
    <div class="card">
      <div class="card-value" style="color: var(--critical)">{summary['critical_leaks']}</div>
      <div class="card-label">Critical Leaks</div>
    </div>
    <div class="card">
      <div class="card-value" style="color: var(--high)">{summary['high_leaks']}</div>
      <div class="card-label">High-Severity Leaks</div>
    </div>
    <div class="card">
      <div class="card-value">{summary['total_endpoints']}</div>
      <div class="card-label">API Endpoints</div>
    </div>
  </div>

  <!-- Dead Code -->
  <div class="section">
    <div class="section-header">
      <h2>💀 Dead Code</h2>
      <span class="count">{summary['dead_code_count']} findings</span>
    </div>
    <div class="section-body">
      {f'<table><thead><tr><th>Function</th><th>Location</th><th>Reason</th><th>Confidence</th><th>Endpoint</th></tr></thead><tbody>{dead_code_rows}</tbody></table>' if dead_code_rows else '<div class="empty">✅ No dead code detected</div>'}
    </div>
  </div>

  <!-- Unused Imports -->
  <div class="section">
    <div class="section-header">
      <h2>📦 Unused Imports</h2>
      <span class="count">{summary['unused_imports_count']} findings</span>
    </div>
    <div class="section-body">
      {f'<table><thead><tr><th>Import Statement</th><th>Location</th></tr></thead><tbody>{unused_imports_rows}</tbody></table>' if unused_imports_rows else '<div class="empty">✅ No unused imports detected</div>'}
    </div>
  </div>

  <!-- Leak Findings -->
  <div class="section">
    <div class="section-header">
      <h2>🔐 Sensitive Data Leaks</h2>
      <span class="count">{summary['total_leaks']} findings</span>
    </div>
    <div class="section-body">
      {f'<table><thead><tr><th>Pattern</th><th>Severity</th><th>Match (Redacted)</th><th>Location</th><th>Category</th><th>Source Function</th></tr></thead><tbody>{leak_rows}</tbody></table>' if leak_rows else '<div class="empty">✅ No sensitive data leaks detected</div>'}
    </div>
  </div>

  <!-- Unreachable Code -->
  <div class="section">
    <div class="section-header">
      <h2>🚫 Unreachable Code</h2>
      <span class="count">{summary['unreachable_code_count']} findings</span>
    </div>
    <div class="section-body">
      {f'<table><thead><tr><th>Location</th><th>Type</th><th>Description</th><th>Snippet</th></tr></thead><tbody>{unreachable_rows}</tbody></table>' if unreachable_rows else '<div class="empty">✅ No unreachable code detected</div>'}
    </div>
  </div>

  <div class="footer">
    Code Usage Intelligence System v1.0.0 &nbsp;|&nbsp; {data['metadata']['timestamp']}
  </div>
</div>

<script>
  document.querySelectorAll('.section-header').forEach(header => {{
    header.addEventListener('click', () => {{
      const body = header.nextElementSibling;
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    }});
  }});
</script>
</body>
</html>"""

    @staticmethod
    def _escape(text: str) -> str:
        """Escape HTML special characters."""
        if not text:
            return ""
        return (
            str(text)
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#x27;")
        )
