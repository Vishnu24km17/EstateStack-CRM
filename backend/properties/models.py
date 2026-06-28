from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Property(models.Model):
    """Property inventory for the company"""
    PROPERTY_TYPES = (
        ('villa', 'Villa'),
        ('apartment', 'Apartment'),
        ('plot', 'Plot'),
        ('commercial', 'Commercial'),
        ('penthouse', 'Penthouse'),
    )
    
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('booked', 'Booked'),
        ('sold', 'Sold'),
        ('under_construction', 'Under Construction'),
    )
    
    name = models.CharField(max_length=200)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    price = models.DecimalField(max_digits=15, decimal_places=2)
    area = models.CharField(max_length=100)  # e.g., "2500 sq ft"
    location = models.CharField(max_length=500)
    city = models.CharField(max_length=100)
    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    description = models.TextField()
    images = models.JSONField(default=list)  # Store image URLs
    amenities = models.JSONField(default=list)  # ['pool', 'gym', 'parking']
    featured = models.BooleanField(default=False)
    
    # Construction company specific
    possession_date = models.DateField(null=True, blank=True)
    builder_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'properties'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class Competitor(models.Model):
    """Track competitor projects"""
    name = models.CharField(max_length=200)
    project_name = models.CharField(max_length=200)
    location = models.CharField(max_length=500)
    price_range = models.CharField(max_length=200)
    status = models.CharField(max_length=50)  # Under Construction, Completed, etc.
    strengths = models.TextField()
    weaknesses = models.TextField()
    our_advantage = models.TextField()
    website = models.URLField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'competitors'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.project_name}"