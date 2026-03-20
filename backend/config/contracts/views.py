# contracts/views.py

import os
from collections import Counter

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse

from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from contracts.models import Contract
from services.analysis_service import analyze_contract
from services.ml_model import accuracy


# -----------------------------
# UPLOAD + ANALYZE CONTRACT
# -----------------------------
@api_view(['POST'])
def upload_contract(request):

    file = request.FILES.get("file")

    if not file:
        return Response(
            {"error": "No file uploaded"},
            status=status.HTTP_400_BAD_REQUEST
        )

    contract = Contract.objects.create(file=file)

    try:
        file_path = contract.file.path

        results = analyze_contract(file_path)

        # Normalize result structure
        contract.analysis = [
            {
                "text": r.get("clause"),
                "risk": r.get("risk"),
                "confidence": r.get("confidence", 0.5),
                "entities": r.get("entities", [])
            }
            for r in results
        ]

        contract.save()

    except Exception as e:
        print("❌ Analysis error:", e)

        return Response(
            {"error": "Analysis failed"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response({
        "message": "Contract uploaded & analyzed successfully",
        "contract_id": contract.id
    })


# -----------------------------
# GET ANALYSIS
# -----------------------------
@api_view(['GET'])
def contract_analysis(request, id):

    try:
        contract = Contract.objects.get(id=id)
    except Contract.DoesNotExist:
        return Response(
            {"error": "Contract not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    return Response({
        "contract_id": contract.id,
        "file_url": contract.file.url,
        "risks": contract.analysis or []
    })


# -----------------------------
# DASHBOARD SUMMARY
# -----------------------------
@api_view(['GET'])
def analysis_summary(request):

    contracts = Contract.objects.all()

    risk_counter = Counter()

    for contract in contracts:
        for r in (contract.analysis or []):
            risk = (r.get("risk") or "low").lower()
            risk_counter[risk] += 1

    return Response({
        "summary": {
            "high": risk_counter.get("high", 0),
            "medium": risk_counter.get("medium", 0),
            "low": risk_counter.get("low", 0),
        }
    })


# -----------------------------
# CONTRACT LIST
# -----------------------------
@api_view(['GET'])
def contract_list(request):

    contracts = Contract.objects.all().order_by('-id')

    return Response([
        {
            "id": c.id,
            "file": os.path.basename(c.file.name)
        }
        for c in contracts
    ])


# -----------------------------
# DOWNLOAD REPORT (PDF)
# -----------------------------
@api_view(['GET'])
def download_report(request, id):

    try:
        contract = Contract.objects.get(id=id)
    except Contract.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="report_{id}.pdf"'

    doc = SimpleDocTemplate(response)
    styles = getSampleStyleSheet()

    elements = []

    # Title
    elements.append(Paragraph("Contract Risk Report", styles['Title']))
    elements.append(Spacer(1, 12))

    for r in (contract.analysis or []):

        text = r.get("text", "")
        risk = r.get("risk", "Low")
        confidence = r.get("confidence", 0.5)

        elements.append(
            Paragraph(
                f"<b>{risk} Risk ({int(confidence * 100)}%)</b><br/>{text}",
                styles['Normal']
            )
        )
        elements.append(Spacer(1, 10))

    doc.build(elements)

    return response


# -----------------------------
# ADVANCED ANALYTICS
# -----------------------------
@api_view(['GET'])
def advanced_analytics(request):

    contracts = Contract.objects.all()

    risk_counter = Counter()
    clause_lengths = []
    analyzed_contracts = 0

    for c in contracts:

        if not c.analysis:
            continue

        analyzed_contracts += 1

        for r in c.analysis:

            risk = (r.get("risk") or "low").lower()
            risk_counter[risk] += 1

            text = r.get("text", "")
            if text:
                clause_lengths.append(len(text.split()))

    avg_length = (
        sum(clause_lengths) / len(clause_lengths)
        if clause_lengths else 0
    )

    return Response({
        "total_contracts": analyzed_contracts,
        "avg_clause_length": round(avg_length, 2),
        "risk_distribution": dict(risk_counter),
        "model_accuracy": round(accuracy, 2)
    })


# -----------------------------
# SEARCH CONTRACTS
# -----------------------------
@api_view(['GET'])
def search_contracts(request):

    query = request.GET.get("q", "").strip()

    contracts = Contract.objects.all()

    if query:
        contracts = contracts.filter(file__icontains=query)

    return Response([
        {
            "id": c.id,
            "file": os.path.basename(c.file.name)
        }
        for c in contracts
    ])