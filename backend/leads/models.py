from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Lead(models.Model):
    LEAD_STATUS = (
        ('new', 'New Lead'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal Sent'),
        ('negotiation', 'Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    LEAD_SOURCE = (
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('website', 'Website'),
        ('referral', 'Referral'),
        ('cold_call', 'Cold Call'),
        ('email', 'Email Campaign'),
        ('event', 'Event/Exhibition'),
        ('walk_in', 'Walk-in'),
        ('other', 'Other'),
    )
    
    # Basic Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    company = models.CharField(max_length=200, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    job_title = models.CharField(max_length=100, blank=True, null=True)
    
    # Property Preferences
    property_type = models.CharField(max_length=50, choices=(
        ('villa', 'Villa'),
        ('apartment', 'Apartment'),
        ('plot', 'Plot'),
        ('commercial', 'Commercial'),
    ), blank=True, null=True)
    preferred_location = models.CharField(max_length=500, blank=True, null=True)
    budget_min = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    bedrooms = models.IntegerField(null=True, blank=True)
    possession_timeline = models.CharField(max_length=100, blank=True, null=True)
    purpose = models.CharField(max_length=50, choices=(
        ('investment', 'Investment'),
        ('self_use', 'Self Use'),
        ('both', 'Both'),
    ), blank=True, null=True)
    
    # Lead Management
    status = models.CharField(max_length=20, choices=LEAD_STATUS, default='new')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    source = models.CharField(max_length=20, choices=LEAD_SOURCE, default='other')
    
    # AI Scores
    score = models.IntegerField(default=0)
    ai_confidence = models.IntegerField(default=0)
    ai_insights = models.TextField(blank=True, null=True)
    next_best_action = models.CharField(max_length=200, blank=True, null=True)
    
    # Assignment
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, 
                                   related_name='assigned_leads')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,
                                  related_name='created_leads')
    
    # Additional Data
    address = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    next_action_date = models.DateTimeField(null=True, blank=True)
    last_contacted = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    converted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'leads'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class LeadActivity(models.Model):
    ACTIVITY_TYPES = (
        ('view', 'View'),
        ('call', 'Phone Call'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
        ('note', 'Note'),
        ('task', 'Task'),
        ('status_change', 'Status Change'),
        ('follow_up', 'Follow Up'),
        ('site_visit', 'Site Visit'),
    )
    
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='lead_activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    scheduled_date = models.DateTimeField()
    completed_date = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    duration_minutes = models.IntegerField(null=True, blank=True)
    outcome = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lead_activities'
        ordering = ['-scheduled_date']
    
    def __str__(self):
        return f"{self.get_activity_type_display()} - {self.lead.full_name}"