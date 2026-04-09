"""
JSON Report Generator

Generates structured JSON reports from intelligence data.
"""

import json
import os
from datetime import datetime

from ..correlation.engine import IntelligenceReport


class JSONReportGenerator:
    """
    Generates JSON reports from IntelligenceReport data.
    
    Usage:
        generator = JSONReportGenerator(output_dir="reports")
        path = generator.generate(report)
    """

    def __init__(self, output_dir: str = "reports"):
        self.output_dir = output_dir

    def generate(self, report: IntelligenceReport,
                 filename: str = None) -> str:
        """
        Generate a JSON report file.
        
        Returns the path to the generated file.
        """
        os.makedirs(self.output_dir, exist_ok=True)

        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"code_intel_report_{timestamp}.json"

        filepath = os.path.join(self.output_dir, filename)
        data = report.to_dict()

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

        return filepath

    def generate_string(self, report: IntelligenceReport) -> str:
        """Generate a JSON string from the report (no file I/O)."""
        return json.dumps(report.to_dict(), indent=2, default=str)
