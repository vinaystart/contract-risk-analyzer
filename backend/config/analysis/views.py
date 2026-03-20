from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from contracts.models import Contract

from services.parser import parse_pdf, parse_docx, parse_txt
from services.clause_extractor import extract_clauses
from services.ner import extract_entities
from services.risk_classifier import classify_risk


@api_view(["GET"])
def analyze_contract(request, contract_id):

    try:
        contract = Contract.objects.get(id=contract_id)

    except Contract.DoesNotExist:
        return Response(
            {"error": "Contract not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    file_path = contract.file.path

    # Detect file type
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

    # Extract clauses
    clauses = extract_clauses(text)

    results = []

    for clause in clauses:

        risk = classify_risk(clause)

        entities = extract_entities(clause)

        results.append({
            "text": clause,
            "risk": risk,
            "entities": entities
        })

    return Response({
        "contract_id": contract_id,
        "clauses": results
    })


@api_view(["GET"])
def risk_summary(request):

    # Temporary static summary
    # Later this can come from database

    return Response({

        "summary": {
            "low": 5,
            "medium": 2,
            "high": 1
        },

        "insights": [
            "Unlimited liability clause detected",
            "Penalty clause may increase risk"
        ]

    })