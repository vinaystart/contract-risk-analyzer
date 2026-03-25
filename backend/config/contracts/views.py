# contracts/views.py

import os
from collections import Counter

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse

from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart

# 🔥 EXISTING IMPORTS
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# 🔥 NEW IMPORTS (ADDED ONLY)
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart

from contracts.models import Contract
from services.analysis_service import analyze_contract
from services.ml_model import get_model_accuracy


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
# 🔥 UPDATED DOWNLOAD REPORT (SaaS LEVEL)
# -----------------------------
@api_view(['GET'])
def download_report(request, id):

    try:
        contract = Contract.objects.get(id=id)
    except Contract.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="report_{id}.pdf"'

    # -----------------------------
    # DOCUMENT SETTINGS
    # -----------------------------
    doc = SimpleDocTemplate(
        response,
        rightMargin=60,
        leftMargin=60,
        topMargin=70,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    primary = colors.HexColor("#6C4DF6")

    # -----------------------------
    # STYLES
    # -----------------------------
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Title'],
        fontSize=18,
        textColor=primary,
        spaceAfter=10
    )

    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        textColor=primary,
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=10,
        leading=15,
        spaceAfter=6
    )

    elements = []

    data = contract.analysis or []

    high = [r for r in data if r.get("risk") == "High"]
    medium = [r for r in data if r.get("risk") == "Medium"]
    low = [r for r in data if r.get("risk") == "Low"]

    total = max(len(data), 1)

    high_p = round((len(high)/total)*100, 1)
    med_p = round((len(medium)/total)*100, 1)
    low_p = round((len(low)/total)*100, 1)

    # -----------------------------
    # HEADER
    # -----------------------------
    elements.append(Paragraph("Contract Risk Analysis Report", title_style))
    elements.append(Paragraph(
        "<font size=9 color=#777777>AI Generated Risk Summary</font>",
        body_style
    ))
    elements.append(Spacer(1, 20))

    # -----------------------------
    # EXECUTIVE SUMMARY
    # -----------------------------
    elements.append(Paragraph("Executive Summary", heading_style))

    elements.append(Paragraph(f"Total Clauses: {len(data)}", body_style))
    elements.append(Paragraph(f"High Risk: {len(high)} ({high_p}%)", body_style))
    elements.append(Paragraph(f"Medium Risk: {len(medium)} ({med_p}%)", body_style))
    elements.append(Paragraph(f"Low Risk: {len(low)} ({low_p}%)", body_style))
    elements.append(Paragraph(
        f"Model Accuracy: {round(get_model_accuracy()*100, 2)}%",
        body_style
    ))

    elements.append(Spacer(1, 20))

    # -----------------------------
    # KPI DASHBOARD (LINE STYLE)
    # -----------------------------
    def kpi_bar(label, value, color):

        table = Table([
            [f"{label} ({value}%)"],
            [""]
        ], colWidths=[450])

        table.setStyle(TableStyle([
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),

            # 🔥 ONLY LINE (PRO STYLE)
            ("LINEBELOW", (0, 1), (0, 1), 4, color),

            ("BOTTOMPADDING", (0, 1), (-1, -1), 8),
        ]))

        return table

    elements.append(Paragraph("Risk Distribution", heading_style))
    elements.append(Spacer(1, 10))

    elements.append(kpi_bar("High Risk", high_p, colors.red))
    elements.append(Spacer(1, 8))

    elements.append(kpi_bar("Medium Risk", med_p, colors.HexColor("#E6B800")))
    elements.append(Spacer(1, 8))

    elements.append(kpi_bar("Low Risk", low_p, colors.green))
    elements.append(Spacer(1, 20))

    # -----------------------------
    # SECTION FUNCTION (LINE STYLE)
    # -----------------------------
    def section(title, items, color):

        elements.append(Paragraph(f"<b>{title}</b>", heading_style))
        elements.append(Spacer(1, 6))

        line = Table([[""]], colWidths=[450])
        line.setStyle(TableStyle([
            ("LINEBELOW", (0, 0), (-1, -1), 2, color)
        ]))

        elements.append(line)
        elements.append(Spacer(1, 10))

        if not items:
            elements.append(Paragraph("No clauses found.", body_style))
            return

        for i, r in enumerate(items, 1):
            elements.append(Paragraph(f"<b>{i}. {r.get('text','')}</b>", body_style))
            elements.append(Paragraph(
                f"<font color=#777777>Reason: {r.get('explanation','Standard clause')}</font>",
                body_style
            ))
            elements.append(Paragraph(
                f"<font color=#777777>Confidence Score: {r.get('confidence',0)}%</font>",
                body_style
            ))
            elements.append(Spacer(1, 10))

    # -----------------------------
    # SECTIONS
    # -----------------------------
    section("High Risk Clauses", high, colors.red)
    section("Medium Risk Clauses", medium, colors.HexColor("#E6B800"))
    section("Low Risk Clauses", low, colors.green)

    # -----------------------------
    # INSIGHTS
    # -----------------------------
    elements.append(Paragraph("Key Insights", heading_style))

    insights = [
        "High-risk clauses may lead to financial or legal exposure.",
        "Termination conditions should be clearly defined.",
        "Penalty clauses should be reviewed carefully."
    ]

    for ins in insights:
        elements.append(Paragraph(f"• {ins}", body_style))

    elements.append(Spacer(1, 20))

    # -----------------------------
    # FOOTER + WATERMARK
    # -----------------------------
    def add_page_elements(canvas, doc):

        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(550, 20, f"Page {doc.page}")

        canvas.setFont("Helvetica-Bold", 40)
        canvas.setFillColor(colors.HexColor("#E6E1FF"))
        canvas.saveState()
        canvas.translate(300, 400)
        canvas.rotate(45)
        canvas.drawCentredString(0, 0, "AI GENERATED REPORT")
        canvas.restoreState()

    # -----------------------------
    # BUILD
    # -----------------------------
    doc.build(elements, onFirstPage=add_page_elements, onLaterPages=add_page_elements)

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
        "model_accuracy": get_model_accuracy()
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