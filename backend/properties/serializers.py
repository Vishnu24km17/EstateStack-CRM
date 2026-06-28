from rest_framework import serializers
from .models import Property, Competitor

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class CompetitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competitor
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'last_updated')