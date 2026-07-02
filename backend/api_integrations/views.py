from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services import GooglePlacesService, ConstructionProjectAPIService
from leads.models import Lead

# Import from properties app
from properties.models import Property, Competitor
from properties.serializers import PropertySerializer, CompetitorSerializer

class SearchPlacesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('query')
        if not query:
            return Response(
                {'error': 'Query is required', 'results': []}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        location = request.query_params.get('location')
        radius = request.query_params.get('radius', 5000)
        
        result = GooglePlacesService.search_places(query, location, radius)
        
        if 'error' in result:
            return Response({
                'error': result['error'],
                'results': []
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result)

class PlaceDetailsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, place_id):
        result = GooglePlacesService.get_place_details(place_id)
        if result and 'error' not in result:
            return Response(result)
        return Response({'error': 'Place not found'}, status=status.HTTP_404_NOT_FOUND)

class EnrichLeadLocationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, lead_id):
        try:
            lead = Lead.objects.get(id=lead_id)
            GooglePlacesService.enrich_lead_with_location(lead)
            return Response({'message': 'Lead location enriched successfully'})
        except Lead.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

class ConstructionProjectDataView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        location = request.query_params.get('location', 'Bengaluru')
        data = ConstructionProjectAPIService.get_project_data(location)
        return Response(data)