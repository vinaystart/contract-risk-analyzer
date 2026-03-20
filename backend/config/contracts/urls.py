from django.urls import path
from .views import (
    upload_contract,
    contract_analysis,
    analysis_summary,
    contract_list,
    download_report,
    advanced_analytics,
    search_contracts
)

urlpatterns = [
    path("upload/", upload_contract),
    path("analysis/<int:id>/", contract_analysis),
    path("analysis/summary/", analysis_summary),
    path("list/", contract_list),
    path("analysis/report/<int:id>/", download_report),
    path('analytics/', advanced_analytics),
    path('search/', search_contracts),
]