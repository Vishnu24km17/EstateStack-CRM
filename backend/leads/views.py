from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import Lead, LeadActivity
from .serializers import LeadSerializer, LeadActivitySerializer, LeadStatusUpdateSerializer
from ai_assistant.services import AIService

class LeadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LeadSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'source', 'assigned_to']
    search_fields = ['first_name', 'last_name', 'email', 'company', 'phone']
    ordering_fields = ['created_at', 'updated_at', 'score', 'next_action_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Lead.objects.all()
        
        # Filter by user role
        user = self.request.user
        if user.role == 'sales_rep':
            queryset = queryset.filter(assigned_to=user)
        elif user.role == 'manager':
            queryset = queryset.filter(Q(assigned_to=user) | Q(created_by=user))
        # Admin sees all
        
        return queryset
    
    def perform_create(self, serializer):
        lead = serializer.save()
        # AI enrichment and scoring
        AIService.enrich_and_score_lead(lead)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        lead = self.get_object()
        serializer = LeadStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        old_status = lead.status
        lead.status = serializer.validated_data['status']
        if serializer.validated_data.get('notes'):
            lead.notes += f"\n\nStatus update: {serializer.validated_data['notes']}"
        
        # Check if won or lost
        if lead.status == 'won' and not lead.converted_at:
            lead.converted_at = timezone.now()
        
        lead.save()
        
        # Log activity
        LeadActivity.objects.create(
            lead=lead,
            user=request.user,
            activity_type='note',
            description=f"Status changed from {old_status} to {lead.status}",
            scheduled_date=timezone.now(),
            is_completed=True
        )
        
        return Response(LeadSerializer(lead).data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        queryset = self.get_queryset()
        
        stats = {
            'total_leads': queryset.count(),
            'new_leads': queryset.filter(status='new').count(),
            'qualified': queryset.filter(status='qualified').count(),
            'proposal': queryset.filter(status='proposal').count(),
            'won': queryset.filter(status='won').count(),
            'lost': queryset.filter(status='lost').count(),
            'by_priority': {},
            'by_source': {},
        }
        
        # Priority distribution
        for priority in ['low', 'medium', 'high', 'urgent']:
            stats['by_priority'][priority] = queryset.filter(priority=priority).count()
        
        # Source distribution
        sources = queryset.values('source').annotate(count=models.Count('id'))
        for item in sources:
            stats['by_source'][item['source']] = item['count']
        
        return Response(stats)

class LeadActivityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LeadActivitySerializer
    
    def get_queryset(self):
        lead_id = self.request.query_params.get('lead_id')
        if lead_id:
            return LeadActivity.objects.filter(lead_id=lead_id)
        return LeadActivity.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)