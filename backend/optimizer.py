import re

FILLER_PATTERNS = [
    r"\bplease\b",
    r"\bkindly\b",
    r"\bi want you to\b",
    r"\bcan you\b",
    r"\bas an ai\b",
    r"\bi need you to\b",
    r"\bmake sure that\b",
]

def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def remove_fillers(text: str) -> str:
    out = text
    for pat in FILLER_PATTERNS:
        out = re.sub(pat, "", out, flags=re.IGNORECASE)
    return normalize_whitespace(out)

def enforce_structure(text: str) -> str:
    return (
        f"{text.strip()}\n"
        "Reply concisely. Use bullets if helpful.\n"
    )

def optimize_prompt(prompt: str) -> dict:
    original = normalize_whitespace(prompt)
    cleaned = remove_fillers(original)

    # Only add structure if prompt is long enough
    if len(cleaned) >= 200 and "Reply" not in cleaned:
        optimized = enforce_structure(cleaned)
    else:
        optimized = cleaned

    return {"original": original, "optimized": optimized}