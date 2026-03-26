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

    doc = SimpleDocTemplate(
        response,
        rightMargin=50,
        leftMargin=50,
        topMargin=60,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # 🎨 COLORS
    HIGH_COLOR = colors.HexColor("#EF4444")
    MEDIUM_COLOR = colors.HexColor("#F59E0B")
    LOW_COLOR = colors.HexColor("#22C55E")
    CARD_BG = colors.HexColor("#F8FAFC")

    # -----------------------------
    # STYLES
    # -----------------------------
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Title'],
        fontSize=18,
        spaceAfter=10
    )

    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=10,
        leading=14
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
    elements.append(Spacer(1, 15))

    # -----------------------------
    # 🔥 GRADIENT KPI BOX
    # -----------------------------
    def kpi_box(label, value, color):

        light_color = colors.Color(
            min(color.red + 0.3, 1),
            min(color.green + 0.3, 1),
            min(color.blue + 0.3, 1)
        )

        box = Table([
            [label],
            [f"{value}%"]
        ], colWidths=[120])

        box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), light_color),
            ("BACKGROUND", (0, 1), (-1, 1), color),

            ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),

            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),

            ("BOX", (0, 0), (-1, -1), 0, color),
        ]))

        return box

    elements.append(Paragraph("Risk Distribution", heading_style))

    kpi_row = Table([
        [
            kpi_box("High", high_p, HIGH_COLOR),
            kpi_box("Medium", med_p, MEDIUM_COLOR),
            kpi_box("Low", low_p, LOW_COLOR),
        ]
    ])

    elements.append(kpi_row)
    elements.append(Spacer(1, 20))

    # -----------------------------
    # CLAUSE SECTION (CARD STYLE)
    # -----------------------------
    def section(title, items, color):

        elements.append(Paragraph(title, heading_style))
        elements.append(Spacer(1, 8))

        if not items:
            elements.append(Paragraph("No clauses found", body_style))
            return

        for i, r in enumerate(items, 1):

            box = Table([[f"{i}. {r.get('text','')}"]], colWidths=[450])

            box.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),

                # LEFT COLOR BAR
                ("LINEBEFORE", (0, 0), (0, -1), 4, color),

                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]))

            elements.append(box)

            elements.append(Paragraph(
                f"Confidence: {round(r.get('confidence',0),2)}%",
                body_style
            ))

            elements.append(Spacer(1, 10))

    section("High Risk Clauses", high, HIGH_COLOR)
    section("Medium Risk Clauses", medium, MEDIUM_COLOR)
    section("Low Risk Clauses", low, LOW_COLOR)

    # -----------------------------
    # INSIGHTS
    # -----------------------------
    elements.append(Spacer(1, 15))
    elements.append(Paragraph("Key Insights", heading_style))

    insights = [
        "High-risk clauses may lead to legal exposure.",
        "Review termination and penalty clauses carefully.",
        "Ensure confidentiality terms are clearly defined."
    ]

    for ins in insights:
        elements.append(Paragraph(f"• {ins}", body_style))

    # -----------------------------
    # 🧾 BORDER + WATERMARK
    # -----------------------------
    def add_page_design(canvas, doc):

        width, height = doc.pagesize

        # BORDER
        canvas.setStrokeColor(colors.HexColor("#CBD5F5"))
        canvas.setLineWidth(1)
        canvas.rect(20, 20, width - 40, height - 40)

        # WATERMARK
        canvas.saveState()
        canvas.setFont("Helvetica-Bold", 40)
        canvas.setFillColor(colors.HexColor("#E6E1FF"))

        canvas.translate(width/2, height/2)
        canvas.rotate(45)
        canvas.drawCentredString(0, 0, "AI GENERATED REPORT")
        canvas.restoreState()

        # PAGE NUMBER
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.grey)
        canvas.drawRightString(width - 30, 20, f"Page {doc.page}")

    # -----------------------------
    # BUILD
    # -----------------------------
    doc.build(
        elements,
        onFirstPage=add_page_design,
        onLaterPages=add_page_design
    )

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