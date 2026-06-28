from django.urls import path
from .views import (
    LeadEnrichView, LeadSummaryView, IntentClassificationView,
    LeadRecommendationsView, AIAssistantChatView
)

urlpatterns = [
    path('enrich/<int:lead_id>/', LeadEnrichView.as_view(), name='lead-enrich'),
    path('summary/<int:lead_id>/', LeadSummaryView.as_view(), name='lead-summary'),
    path('classify-intent/', IntentClassificationView.as_view(), name='classify-intent'),
    path('recommendations/', LeadRecommendationsView.as_view(), name='recommendations'),
    path('chat/', AIAssistantChatView.as_view(), name='ai-chat'),
]