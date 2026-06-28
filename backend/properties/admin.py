from django.contrib import admin
from .models import Property, Competitor

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('name', 'property_type', 'status', 'price', 'city', 'created_at')
    list_filter = ('property_type', 'status', 'city')
    search_fields = ('name', 'location', 'city')
    ordering = ('-created_at',)

@admin.register(Competitor)
class CompetitorAdmin(admin.ModelAdmin):
    list_display = ('name', 'project_name', 'location', 'price_range', 'last_updated')
    search_fields = ('name', 'project_name', 'location')
    ordering = ('-last_updated',)