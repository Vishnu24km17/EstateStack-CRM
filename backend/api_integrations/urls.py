from django.urls import path
from .views import (
    SearchPlacesView, PlaceDetailsView, 
    EnrichLeadLocationView, ConstructionProjectDataView
)

urlpatterns = [
    path('places/search/', SearchPlacesView.as_view(), name='search-places'),
    path('places/details/<str:place_id>/', PlaceDetailsView.as_view(), name='place-details'),
    path('enrich-location/<int:lead_id>/', EnrichLeadLocationView.as_view(), name='enrich-location'),
    path('construction-projects/', ConstructionProjectDataView.as_view(), name='construction-projects'),
]