from rest_framework import serializers
from .models import Contract


# ✅ Contract Serializer (for DB model)
class ContractSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contract
        fields = "__all__"


# ✅ Analytics Serializer (for dashboard API)
class AnalyticsSerializer(serializers.Serializer):
    total_contracts = serializers.IntegerField()
    avg_clause_length = serializers.FloatField()
    risk_distribution = serializers.DictField()