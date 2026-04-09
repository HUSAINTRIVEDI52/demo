"""
Luhn Algorithm

Implements the Luhn algorithm (mod-10) for validating credit card numbers.
Used to reduce false positives when detecting potential CC numbers in logs.
"""


def luhn_check(number_str: str) -> bool:
    """
    Validate a number string using the Luhn algorithm.
    
    The Luhn algorithm works by:
    1. Starting from the rightmost digit, double every second digit
    2. If doubling results in a number > 9, subtract 9
    3. Sum all digits
    4. If the total modulo 10 is 0, the number is valid
    
    Args:
        number_str: A string of digits (spaces/dashes are stripped)
    
    Returns:
        True if the number passes the Luhn check
    
    Examples:
        >>> luhn_check("4532015112830366")
        True
        >>> luhn_check("4532015112830367")
        False
    """
    # Strip spaces, dashes, and other separators
    digits = number_str.replace(" ", "").replace("-", "").replace(".", "")

    # Must be all digits
    if not digits.isdigit():
        return False

    # Must be at least 2 digits
    if len(digits) < 2:
        return False

    total = 0
    reverse_digits = digits[::-1]

    for i, char in enumerate(reverse_digits):
        digit = int(char)

        if i % 2 == 1:  # Double every second digit from the right
            digit *= 2
            if digit > 9:
                digit -= 9

        total += digit

    return total % 10 == 0


def is_valid_credit_card(number_str: str) -> bool:
    """
    Check if a string could be a valid credit card number.
    
    Validates both the format (length, prefix) and Luhn checksum.
    
    Known prefixes:
    - Visa: starts with 4, 13 or 16 digits
    - MasterCard: starts with 51-55 or 2221-2720, 16 digits
    - Amex: starts with 34 or 37, 15 digits
    - Discover: starts with 6011 or 65, 16 digits
    """
    cleaned = number_str.replace(" ", "").replace("-", "")

    if not cleaned.isdigit():
        return False

    length = len(cleaned)

    # Check length (credit cards are 13-19 digits)
    if length < 13 or length > 19:
        return False

    # Check Luhn
    if not luhn_check(cleaned):
        return False

    # Check known prefixes
    if cleaned[0] == "4" and length in (13, 16, 19):  # Visa
        return True
    if cleaned[:2] in ("51", "52", "53", "54", "55") and length == 16:  # MasterCard
        return True
    if cleaned[:2] in ("34", "37") and length == 15:  # Amex
        return True
    if (cleaned[:4] == "6011" or cleaned[:2] == "65") and length == 16:  # Discover
        return True

    # Generic Luhn-valid number in CC length range
    return True
