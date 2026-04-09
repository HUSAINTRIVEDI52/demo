"""
PR Comment Generator

Generates GitHub PR comments summarizing intelligence findings.
Posts comments via the GitHub API.
"""

import os
import json
import requests
from typing import Optional

from ..correlation.engine import IntelligenceReport


class PRCommentGenerator:
    """
    Generates and posts PR comments with intelligence summary.
    
    Usage:
        generator = PRCommentGenerator(github_token="ghp_...")
        
        # Generate markdown
        markdown = generator.generate_markdown(report)
        
        # Post to a PR
        generator.post_comment(
            repo="owner/repo",
            pr_number=42,
            report=report,
        )
    """

    def __init__(self, github_token: str = None):
        self.github_token = github_token or os.environ.get("GITHUB_TOKEN", "")

    def generate_markdown(self, report: IntelligenceReport) -> str:
        """Generate a markdown summary suitable for a PR comment."""
        data = report.to_dict()
        summary = data["summary"]

        # Status badge
        if summary["has_critical_issues"]:
            status = "🔴 **CRITICAL ISSUES FOUND** — Build should fail"
        elif summary["dead_code_count"] > 0 or summary["total_leaks"] > 0:
            status = "🟡 **WARNINGS** — Review recommended"
        else:
            status = "🟢 **ALL CLEAR** — No issues detected"

        lines = [
            "## 🔍 Code Usage Intelligence Report",
            "",
            f"> {status}",
            "",
            "### Summary",
            "",
            "| Metric | Value |",
            "|--------|-------|",
            f"| Total Functions | {summary['total_functions']} |",
            f"| Dead Code | {summary['dead_code_count']} ({summary['dead_code_percentage']}%) |",
            f"| Unused Imports | {summary['unused_imports_count']} |",
            f"| API Endpoints | {summary['total_endpoints']} |",
            f"| Critical Leaks | {summary['critical_leaks']} |",
            f"| High-Severity Leaks | {summary['high_leaks']} |",
            f"| Unreachable Code | {summary['unreachable_code_count']} |",
            "",
        ]

        # Dead code section
        if data["dead_code"]:
            lines.append("### 💀 Dead Code")
            lines.append("")
            lines.append("<details>")
            lines.append(f"<summary>{summary['dead_code_count']} functions never executed</summary>")
            lines.append("")
            lines.append("| Function | Location | Confidence |")
            lines.append("|----------|----------|------------|")
            for item in data["dead_code"][:20]:  # Limit to 20
                lines.append(
                    f"| `{item['qualified_name']}` | "
                    f"`{os.path.basename(item['file'])}:{item['line']}` | "
                    f"{item['confidence'].upper()} |"
                )
            if len(data["dead_code"]) > 20:
                lines.append(f"| ... | +{len(data['dead_code']) - 20} more | |")
            lines.append("")
            lines.append("</details>")
            lines.append("")

        # Leak findings section
        if data["leak_findings"]:
            lines.append("### 🔐 Sensitive Data Leaks")
            lines.append("")

            # Group by severity
            critical = [f for f in data["leak_findings"] if f["severity"] == "CRITICAL"]
            high = [f for f in data["leak_findings"] if f["severity"] == "HIGH"]
            medium = [f for f in data["leak_findings"] if f["severity"] == "MEDIUM"]

            if critical:
                lines.append(f"**🔴 Critical ({len(critical)}):**")
                for item in critical[:10]:
                    lines.append(
                        f"- `{item['pattern_name']}` at "
                        f"`{os.path.basename(item['file'])}:{item['line']}` — "
                        f"{item['description']}"
                    )
                lines.append("")

            if high:
                lines.append(f"**🟠 High ({len(high)}):**")
                for item in high[:10]:
                    lines.append(
                        f"- `{item['pattern_name']}` at "
                        f"`{os.path.basename(item['file'])}:{item['line']}` — "
                        f"{item['description']}"
                    )
                lines.append("")

            if medium:
                lines.append(f"**🟡 Medium ({len(medium)}):**")
                for item in medium[:5]:
                    lines.append(
                        f"- `{item['pattern_name']}` at "
                        f"`{os.path.basename(item['file'])}:{item['line']}`"
                    )
                if len(medium) > 5:
                    lines.append(f"- ... +{len(medium) - 5} more")
                lines.append("")

        # Unused imports
        if data["unused_imports"]:
            lines.append("### 📦 Unused Imports")
            lines.append("")
            lines.append("<details>")
            lines.append(f"<summary>{summary['unused_imports_count']} unused imports</summary>")
            lines.append("")
            for item in data["unused_imports"][:15]:
                lines.append(
                    f"- `{item['import_statement']}` in "
                    f"`{os.path.basename(item['file'])}:{item['line']}`"
                )
            if len(data["unused_imports"]) > 15:
                lines.append(f"- ... +{len(data['unused_imports']) - 15} more")
            lines.append("")
            lines.append("</details>")
            lines.append("")

        # Footer
        lines.append("---")
        lines.append(f"*Generated by Code Usage Intelligence System v1.0.0 at {data['metadata']['timestamp']}*")

        return "\n".join(lines)

    def post_comment(self, repo: str, pr_number: int,
                     report: IntelligenceReport) -> Optional[dict]:
        """
        Post a comment on a GitHub PR.
        
        Args:
            repo: Repository in "owner/repo" format
            pr_number: Pull request number
            report: The intelligence report
        
        Returns:
            API response dict or None on failure
        """
        if not self.github_token:
            print("WARNING: No GitHub token configured. Skipping PR comment.")
            return None

        markdown = self.generate_markdown(report)
        url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"

        headers = {
            "Authorization": f"Bearer {self.github_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

        try:
            response = requests.post(
                url,
                headers=headers,
                json={"body": markdown},
                timeout=30,
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"ERROR: Failed to post PR comment: {e}")
            return None

    def save_markdown(self, report: IntelligenceReport,
                      output_path: str = "reports/pr_comment.md") -> str:
        """Save the markdown comment to a file."""
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        markdown = self.generate_markdown(report)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(markdown)
        return output_path
