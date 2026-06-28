from rest_framework import serializers
from .models import Lead, LeadActivity
from accounts.serializers import UserSerializer

class LeadActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LeadActivity
        fields = '__all__'
        read_only_fields = ('id', 'created_at')
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() if obj.user else None

class LeadSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    full_name = serializers.ReadOnlyField()
    activities = LeadActivitySerializer(many=True, read_only=True)
    
    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'score')
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class LeadStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Lead.LEAD_STATUS)
    notes = serializers.CharField(required=False, allow_blank=True)