from rest_framework import serializers
from .models import Note
from accounts.serializers import UserSerializer

class NoteSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Note
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')