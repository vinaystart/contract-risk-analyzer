from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from contracts.models import Contract

from services.parser import parse_pdf, parse_docx, parse_txt
from services.clause_extractor import extract_clauses
from services.ner import extract_entities
from services.risk_classifier import classify_risk
from services.ml_model import get_model_accuracy  # 🔥 IMPORTANT


# -----------------------------
# ANALYZE CONTRACT
# -----------------------------
@api_view(["GET"])
@permission_classes([AllowAny])   # 🔥 FIX 401
def analyze_contract(request, contract_id):

    try:
        contract = Contract.objects.get(id=contract_id)

    except Contract.DoesNotExist:
        return Response(
            {"error": "Contract not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    file_path = contract.file.path

    # -----------------------------
    # PARSE FILE
    # -----------------------------
    if file_path.endswith(".pdf"):
        text = parse_pdf(file_path)

    elif file_path.endswith(".docx"):
        text = parse_docx(file_path)

    elif file_path.endswith(".txt"):
        text = parse_txt(file_path)

    else:
        return Response(
            {"error": "Unsupported file format"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # -----------------------------
    # CLAUSE EXTRACTION
    # -----------------------------
    clauses = extract_clauses(text)

    results = []

    for clause in clauses:
        risk = classify_risk(clause)
        entities = extract_entities(clause)

        results.append({
            "text": clause,
            "risk": risk["risk"],
            "confidence": risk["confidence"],
            "explanation": risk["explanation"],
            "entities": entities
        })

    # -----------------------------
    # RESPONSE WITH ACCURACY
    # -----------------------------
    return Response({
        "contract_id": contract_id,
        "accuracy": get_model_accuracy(),   # 🔥 FIXED
        "total_clauses": len(results),
        "clauses": results
    })


# -----------------------------
# RISK SUMMARY (DYNAMIC)
# -----------------------------
@api_view(["GET"])
@permission_classes([AllowAny])   # 🔥 FIX 401
def risk_summary(request):

    contract_id = request.GET.get("contract_id")

    if not contract_id:
        return Response({"error": "contract_id required"}, status=400)

    try:
        contract = Contract.objects.get(id=contract_id)
    except Contract.DoesNotExist:
        return Response({"error": "Contract not found"}, status=404)

    file_path = contract.file.path

    # Parse file
    if file_path.endswith(".pdf"):
        text = parse_pdf(file_path)
    elif file_path.endswith(".docx"):
        text = parse_docx(file_path)
    elif file_path.endswith(".txt"):
        text = parse_txt(file_path)
    else:
        return Response({"error": "Unsupported file"}, status=400)

    clauses = extract_clauses(text)

    low = medium = high = 0
    insights = []

    for clause in clauses:
        risk = classify_risk(clause)

        if risk["risk"] == "Low":
            low += 1
        elif risk["risk"] == "Medium":
            medium += 1
        else:
            high += 1

        # collect insights (only important ones)
        if risk["risk"] == "High":
            insights.append(risk["explanation"])

    return Response({
        "summary": {
            "low": low,
            "medium": medium,
            "high": high
        },
        "accuracy": get_model_accuracy(),   # 🔥 ADDED
        "insights": insights[:5]  # limit top insights
    })