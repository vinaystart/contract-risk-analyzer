# services/risk_classifier.py

from .ml_model import predict_risk_with_confidence


def classify_risk(clause):

    # -----------------------------
    # INPUT SAFETY
    # -----------------------------
    if not clause or not clause.strip():
        return {
            "risk": "Low",
            "confidence": 0.5,
            "explanation": "Empty or invalid clause. Defaulted to low risk."
        }

    try:
        # -----------------------------
        # ✅ ML MODEL (PRIMARY)
        # -----------------------------
        risk, confidence = predict_risk_with_confidence(clause)

        explanation = generate_explanation(clause, risk)

        return {
            "risk": risk,
            "confidence": confidence,
            "explanation": explanation
        }

    except Exception as e:
        print("ML error:", e)

    # -----------------------------
    # 🔁 FALLBACK (RULE-BASED)
    # -----------------------------
    clause_lower = clause.lower()

    high_keywords = [
        "unlimited liability",
        "indemnify",
        "termination without notice",
        "full liability",
        "legal responsibility"
    ]

    medium_keywords = [
        "penalty",
        "delay",
        "breach",
        "late delivery",
        "non-compliance"
    ]

    for k in high_keywords:
        if k in clause_lower:
            return {
                "risk": "High",
                "confidence": 0.6,
                "explanation": "This clause introduces significant legal or financial liability."
            }

    for k in medium_keywords:
        if k in clause_lower:
            return {
                "risk": "Medium",
                "confidence": 0.6,
                "explanation": "This clause may cause operational or compliance risks."
            }

    # -----------------------------
    # DEFAULT
    # -----------------------------
    return {
        "risk": "Low",
        "confidence": 0.5,
        "explanation": "This clause appears standard with minimal risk."
    }


# -----------------------------
# 🔥 AI EXPLANATION ENGINE
# -----------------------------
def generate_explanation(clause, risk):

    clause_lower = clause.lower()

    # HIGH RISK
    if risk == "High":

        if "liability" in clause_lower:
            return "This clause exposes the organization to high financial liability."

        if "indemnify" in clause_lower:
            return "Indemnification transfers legal responsibility and risk."

        if "termination" in clause_lower:
            return "Uncontrolled termination terms may disrupt business operations."

        if "damages" in clause_lower:
            return "This clause may result in high financial penalties."

        return "This clause represents a significant legal or financial risk."

    # MEDIUM RISK
    if risk == "Medium":

        if "penalty" in clause_lower:
            return "Penalties may lead to financial impact under certain conditions."

        if "delay" in clause_lower:
            return "Delays could impact delivery timelines and obligations."

        if "breach" in clause_lower:
            return "Potential breach conditions may affect contract compliance."

        return "This clause introduces moderate operational or compliance risks."

    # LOW RISK
    return "This clause follows standard contractual terms with low risk."