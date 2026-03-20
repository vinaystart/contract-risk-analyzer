# services/clause_extractor.py

import re


def extract_clauses(text):

    if not text:
        return []

    # -----------------------------
    # CLEAN TEXT
    # -----------------------------
    text = text.replace("\r", "\n")

    # Normalize multiple newlines
    text = re.sub(r'\n+', '\n', text)

    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text)

    # -----------------------------
    # SMART SPLIT (LEGAL FRIENDLY)
    # -----------------------------
    parts = re.split(
        r'\n|(?<=\.)\s|(?<=;)\s|(?<=\))\s',
        text
    )

    clauses = []

    for part in parts:

        part = part.strip()

        # -----------------------------
        # REMOVE NUMBERING (1., 1.1, (a))
        # -----------------------------
        part = re.sub(r'^\(?[0-9a-zA-Z]+\)?[\.\)]\s*', '', part)

        # -----------------------------
        # FILTER SMALL / NOISE
        # -----------------------------
        if len(part) > 20:
            clauses.append(part)

    # -----------------------------
    # FALLBACK (CRITICAL)
    # -----------------------------
    if not clauses:
        print("⚠️ Clause extractor failed → fallback")

        clauses = [
            line.strip()
            for line in text.split("\n")
            if len(line.strip()) > 10
        ]

    # -----------------------------
    # FINAL SAFETY
    # -----------------------------
    if not clauses:
        clauses = [text]

    print("EXTRACTED CLAUSES:", len(clauses))

    return clauses