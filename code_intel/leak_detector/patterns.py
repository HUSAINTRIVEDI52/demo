"""
Sensitive Data Patterns

Defines regex patterns and validators for detecting PII, secrets, and
other sensitive data in logs and source code.
"""

import re
from dataclasses import dataclass
from enum import Enum
from typing import Optional

from .luhn import luhn_check, is_valid_credit_card


class Severity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


@dataclass
class LeakFinding:
    """Represents a detected sensitive data leak."""
    pattern_name: str
    severity: Severity
    file_path: str
    line_number: int
    matched_text: str           # The raw match (will be redacted in reports)
    redacted_text: str          # Redacted version for safe display
    context: str                # Surrounding text for context
    description: str
    category: str               # "pii", "secret", "risky_logging"

    def to_dict(self) -> dict:
        return {
            "pattern_name": self.pattern_name,
            "severity": self.severity.value,
            "file": self.file_path,
            "line": self.line_number,
            "redacted_match": self.redacted_text,
            "description": self.description,
            "category": self.category,
        }


# ─── Pattern Definitions ───────────────────────────────────────────

@dataclass
class PatternRule:
    """A pattern rule for matching sensitive data."""
    name: str
    regex: re.Pattern
    severity: Severity
    category: str
    description: str
    validator: Optional[callable] = None  # Optional post-match validation
    min_length: int = 0
    max_length: int = 10000


# Compiled pattern rules
LEAK_PATTERNS: list[PatternRule] = [
    # ── Credit Cards ──
    PatternRule(
        name="credit_card_visa",
        regex=re.compile(r"\b4[0-9]{3}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}\b"),
        severity=Severity.CRITICAL,
        category="pii",
        description="Potential Visa credit card number detected",
        validator=lambda m: is_valid_credit_card(m),
    ),
    PatternRule(
        name="credit_card_mastercard",
        regex=re.compile(r"\b5[1-5][0-9]{2}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}\b"),
        severity=Severity.CRITICAL,
        category="pii",
        description="Potential MasterCard credit card number detected",
        validator=lambda m: is_valid_credit_card(m),
    ),
    PatternRule(
        name="credit_card_amex",
        regex=re.compile(r"\b3[47][0-9]{2}[\s\-]?[0-9]{6}[\s\-]?[0-9]{5}\b"),
        severity=Severity.CRITICAL,
        category="pii",
        description="Potential American Express credit card number detected",
        validator=lambda m: is_valid_credit_card(m),
    ),
    PatternRule(
        name="credit_card_generic",
        regex=re.compile(r"\b[0-9]{4}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}\b"),
        severity=Severity.HIGH,
        category="pii",
        description="Potential credit card number (generic 16-digit pattern)",
        validator=lambda m: is_valid_credit_card(m),
    ),

    # ── Email Addresses ──
    PatternRule(
        name="email_address",
        regex=re.compile(
            r"\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b"
        ),
        severity=Severity.MEDIUM,
        category="pii",
        description="Email address detected in output/log",
    ),

    # ── API Keys & Tokens ──
    PatternRule(
        name="aws_access_key",
        regex=re.compile(r"\b(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b"),
        severity=Severity.CRITICAL,
        category="secret",
        description="Potential AWS Access Key ID detected",
    ),
    PatternRule(
        name="aws_secret_key",
        regex=re.compile(r"(?i)(?:aws_secret_access_key|aws_secret_key)\s*[=:]\s*['\"]?([A-Za-z0-9/+=]{40})['\"]?"),
        severity=Severity.CRITICAL,
        category="secret",
        description="Potential AWS Secret Access Key detected",
    ),
    PatternRule(
        name="generic_api_key",
        regex=re.compile(
            r"(?i)(?:api[_\-]?key|apikey|api[_\-]?secret|api[_\-]?token)\s*[=:]\s*['\"]?([a-zA-Z0-9_\-]{20,})['\"]?"
        ),
        severity=Severity.HIGH,
        category="secret",
        description="Potential API key/secret detected",
    ),
    PatternRule(
        name="bearer_token",
        regex=re.compile(r"(?i)bearer\s+[a-zA-Z0-9_\-\.]{20,}"),
        severity=Severity.HIGH,
        category="secret",
        description="Bearer token detected in output",
    ),
    PatternRule(
        name="jwt_token",
        regex=re.compile(r"\beyJ[a-zA-Z0-9_\-]*\.eyJ[a-zA-Z0-9_\-]*\.[a-zA-Z0-9_\-]+\b"),
        severity=Severity.HIGH,
        category="secret",
        description="JWT token detected",
    ),
    PatternRule(
        name="private_key",
        regex=re.compile(r"-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----"),
        severity=Severity.CRITICAL,
        category="secret",
        description="Private key detected in output",
    ),
    PatternRule(
        name="github_token",
        regex=re.compile(r"\b(ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})\b"),
        severity=Severity.CRITICAL,
        category="secret",
        description="GitHub personal access token detected",
    ),
    PatternRule(
        name="slack_token",
        regex=re.compile(r"\bxox[bpors]-[a-zA-Z0-9\-]{10,}\b"),
        severity=Severity.HIGH,
        category="secret",
        description="Slack token detected",
    ),

    # ── SSN ──
    PatternRule(
        name="ssn",
        regex=re.compile(r"\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b"),
        severity=Severity.CRITICAL,
        category="pii",
        description="Potential Social Security Number detected",
    ),

    # ── Phone Numbers ──
    PatternRule(
        name="phone_number",
        regex=re.compile(r"\b(?:\+1[\s\-]?)?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{4}\b"),
        severity=Severity.MEDIUM,
        category="pii",
        description="Potential phone number detected",
    ),

    # ── Passwords in Strings ──
    PatternRule(
        name="password_in_string",
        regex=re.compile(r"(?i)(?:password|passwd|pwd)\s*[=:]\s*['\"][^'\"]{4,}['\"]"),
        severity=Severity.CRITICAL,
        category="secret",
        description="Hardcoded password detected",
    ),

    # ── Connection Strings ──
    PatternRule(
        name="connection_string",
        regex=re.compile(r"(?i)(?:mysql|postgres|postgresql|mongodb|redis|sqlite):\/\/[^\s'\"]+"),
        severity=Severity.HIGH,
        category="secret",
        description="Database connection string detected",
    ),
]

# ── Risky Logging Patterns (in source code) ──
RISKY_LOGGING_PATTERNS: list[PatternRule] = [
    PatternRule(
        name="logging_user_object",
        regex=re.compile(
            r"(?:logging|logger|log)\.\w+\(.*(?:user|customer|patient|person|employee)(?:\b|[)\],\s])",
            re.IGNORECASE,
        ),
        severity=Severity.HIGH,
        category="risky_logging",
        description="Logging appears to include a user/person object — may leak PII",
    ),
    PatternRule(
        name="logging_request_body",
        regex=re.compile(
            r"(?:logging|logger|log)\.\w+\(.*(?:request\.body|request\.data|request\.json|req\.body)",
            re.IGNORECASE,
        ),
        severity=Severity.HIGH,
        category="risky_logging",
        description="Logging full request body — may contain sensitive data",
    ),
    PatternRule(
        name="logging_password",
        regex=re.compile(
            r"(?:logging|logger|log|print)\s*[\.(].*(?:password|passwd|secret|token|api_key|credit)",
            re.IGNORECASE,
        ),
        severity=Severity.CRITICAL,
        category="risky_logging",
        description="Logging appears to include password/secret/token",
    ),
    PatternRule(
        name="print_user_data",
        regex=re.compile(
            r"print\s*\(.*(?:user|password|secret|token|credit_card|ssn|email)",
            re.IGNORECASE,
        ),
        severity=Severity.MEDIUM,
        category="risky_logging",
        description="Print statement may expose sensitive data",
    ),
]


class LeakPatternMatcher:
    """
    Matches sensitive data patterns against text content.
    
    Usage:
        matcher = LeakPatternMatcher()
        findings = matcher.scan_text(log_content, file_path="app.log")
        
        # For source code (also checks risky logging patterns)
        findings = matcher.scan_source(source_code, file_path="app.py")
    """

    def __init__(self, enabled_patterns: dict[str, bool] = None):
        """
        Args:
            enabled_patterns: Dict of pattern categories to enable/disable.
                Example: {"credit_cards": True, "emails": False}
        """
        self.enabled = enabled_patterns or {}
        self.patterns = self._filter_patterns(LEAK_PATTERNS)
        self.risky_patterns = RISKY_LOGGING_PATTERNS

    def _filter_patterns(self, patterns: list[PatternRule]) -> list[PatternRule]:
        """Filter patterns based on enabled configuration."""
        if not self.enabled:
            return patterns

        category_map = {
            "credit_cards": ["credit_card_visa", "credit_card_mastercard",
                             "credit_card_amex", "credit_card_generic"],
            "emails": ["email_address"],
            "api_keys": ["aws_access_key", "aws_secret_key", "generic_api_key",
                         "bearer_token", "github_token", "slack_token"],
            "ssn": ["ssn"],
            "jwt_tokens": ["jwt_token"],
            "phone_numbers": ["phone_number"],
        }

        disabled_names = set()
        for category, enabled in self.enabled.items():
            if not enabled and category in category_map:
                disabled_names.update(category_map[category])

        return [p for p in patterns if p.name not in disabled_names]

    def scan_text(self, text: str, file_path: str = "<unknown>") -> list[LeakFinding]:
        """Scan text content (e.g., log output) for sensitive data patterns."""
        findings = []
        lines = text.splitlines()

        for line_num, line in enumerate(lines, 1):
            for pattern in self.patterns:
                for match in pattern.regex.finditer(line):
                    matched = match.group(0)

                    # Run validator if present
                    if pattern.validator and not pattern.validator(matched):
                        continue

                    findings.append(LeakFinding(
                        pattern_name=pattern.name,
                        severity=pattern.severity,
                        file_path=file_path,
                        line_number=line_num,
                        matched_text=matched,
                        redacted_text=self._redact(matched),
                        context=line.strip()[:200],
                        description=pattern.description,
                        category=pattern.category,
                    ))

        return findings

    def scan_source(self, source: str, file_path: str = "<unknown>") -> list[LeakFinding]:
        """Scan source code for both data leaks and risky logging patterns."""
        # First scan for data leaks
        findings = self.scan_text(source, file_path)

        # Then scan for risky logging patterns
        lines = source.splitlines()
        for line_num, line in enumerate(lines, 1):
            # Skip comment-only lines
            stripped = line.strip()
            if stripped.startswith("#"):
                continue

            for pattern in self.risky_patterns:
                if pattern.regex.search(line):
                    findings.append(LeakFinding(
                        pattern_name=pattern.name,
                        severity=pattern.severity,
                        file_path=file_path,
                        line_number=line_num,
                        matched_text=stripped,
                        redacted_text=stripped[:100],
                        context=stripped[:200],
                        description=pattern.description,
                        category=pattern.category,
                    ))

        return findings

    @staticmethod
    def _redact(text: str) -> str:
        """Redact sensitive data, keeping first 4 and last 4 characters."""
        if len(text) <= 8:
            return "*" * len(text)
        return text[:4] + "*" * (len(text) - 8) + text[-4:]
