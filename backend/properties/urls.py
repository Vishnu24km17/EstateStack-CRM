from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, CompetitorViewSet

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'competitors', CompetitorViewSet, basename='competitor')

urlpatterns = [
    path('', include(router.urls)),
]