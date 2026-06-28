from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
from .services import AIService
from leads.models import Lead
import logging

logger = logging.getLogger(__name__)

class LeadEnrichView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, lead_id):
        try:
            lead = Lead.objects.get(id=lead_id)
            if lead.assigned_to != request.user and request.user.role not in ['admin', 'manager']:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
            AIService.enrich_and_score_lead(lead)
            return Response({'message': 'Lead enriched successfully'})
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Enrichment error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LeadSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, lead_id):
        try:
            lead = Lead.objects.get(id=lead_id)
            summary = AIService.generate_lead_summary(lead)
            return Response({'summary': summary})
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Summary error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class IntentClassificationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        text = request.data.get('text', '')
        if not text:
            return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        result = AIService.classify_lead_intent(text)
        return Response(result)

class LeadRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        recommendations = AIService.get_lead_recommendations(request.user)
        return Response({'recommendations': recommendations})

class AIAssistantChatView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        query = request.data.get('query', '')
        
        if not query:
            return Response(
                {'response': 'Please enter a question or query.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            response = AIService.chat_with_lead_data(query, request.user)
            return Response({'response': response})
        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return Response(
                {'response': f'Error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )