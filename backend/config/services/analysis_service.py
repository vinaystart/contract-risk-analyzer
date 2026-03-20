def analyze_contract(file_path):

    import os

    from .parser import (
        parse_pdf,
        parse_docx,
        parse_txt,
        parse_pdf_with_positions  # 🔥 NEW
    )
    from .clause_extractor import extract_clauses
    from .risk_classifier import classify_risk
    from .ner import extract_entities

    ext = os.path.splitext(file_path)[1].lower()

    # -----------------------------
    # 📄 PARSE FILE
    # -----------------------------
    if ext == ".pdf":
        text = parse_pdf(file_path)
        pdf_positions = parse_pdf_with_positions(file_path)  # 🔥 NEW

    elif ext == ".docx":
        text = parse_docx(file_path)
        pdf_positions = []

    elif ext == ".txt":
        text = parse_txt(file_path)
        pdf_positions = []

    else:
        raise ValueError("Unsupported file type")

    print("TEXT LENGTH:", len(text))

    # -----------------------------
    # 🛡️ FAIL SAFE
    # -----------------------------
    if not text or len(text.strip()) == 0:
        print("⚠️ No text extracted → fallback")
        text = "This contract includes payment terms and termination clause."

    # -----------------------------
    # ✂️ CLAUSE EXTRACTION
    # -----------------------------
    clauses = extract_clauses(text)

    print("CLAUSES COUNT:", len(clauses))

    if not clauses or len(clauses) < 2:
        clauses = [c.strip() for c in text.split("\n") if len(c.strip()) > 10]

    if not clauses:
        clauses = [text]

    # -----------------------------
    # 🔥 CLAUSE → POSITION MATCHING
    # -----------------------------
    def find_positions(clause, words):

        if not words:
            return []

        clause_words = set(clause.lower().split())

        matches = []

        for w in words:

            word = w.get("text", "").lower()

            if word in clause_words:
                matches.append({
                    "x0": w["x0"],
                    "x1": w["x1"],
                    "top": w["top"],
                    "bottom": w["bottom"],
                    "page": w["page"]
                })

        # 🔥 LIMIT (performance safe)
        return matches[:30]

    # -----------------------------
    # 🧠 PROCESS CLAUSES
    # -----------------------------
    results = []

    for clause in clauses:

        clause = clause.strip()

        if len(clause) < 15:
            continue

        # ✅ ML
        risk_data = classify_risk(clause)

        # ✅ NER
        entities = extract_entities(clause)

        # ✅ CATEGORY
        category = classify_clause_type(clause)

        # 🔥 POSITION MATCH
        positions = find_positions(clause, pdf_positions)

        results.append({
            "clause": clause,
            "risk": risk_data.get("risk"),
            "confidence": risk_data.get("confidence"),
            "explanation": risk_data.get("explanation"),
            "category": category,
            "entities": entities,
            "positions": positions  # 🔥 FINAL KEY
        })

    # -----------------------------
    # 🛑 LAST DEFENSE
    # -----------------------------
    if not results:
        results = [
            {
                "clause": text[:200],
                "risk": "Medium",
                "confidence": 0.5,
                "explanation": "Fallback analysis applied.",
                "category": "General",
                "entities": [],
                "positions": []
            }
        ]

    print("FINAL RESULTS:", len(results))

    return results


# -----------------------------
# 🧠 CLAUSE CATEGORY CLASSIFIER
# -----------------------------
def classify_clause_type(clause):

    clause_lower = clause.lower()

    if "liability" in clause_lower:
        return "Liability"

    if "termination" in clause_lower:
        return "Termination"

    if "payment" in clause_lower or "invoice" in clause_lower:
        return "Payment Terms"

    if "confidential" in clause_lower:
        return "Confidentiality"

    if "dispute" in clause_lower or "arbitration" in clause_lower:
        return "Dispute Resolution"

    if "delivery" in clause_lower:
        return "Delivery"

    return "General"