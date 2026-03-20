from django.urls import path
from .views import analyze_contract, risk_summary

urlpatterns = [
    path("analyze/<int:contract_id>/", analyze_contract),
    path("risk-summary/", risk_summary),
]