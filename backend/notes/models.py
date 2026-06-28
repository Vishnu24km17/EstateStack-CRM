from django.db import models
from django.contrib.auth import get_user_model
from leads.models import Lead

User = get_user_model()

class Note(models.Model):
    NOTE_TYPES = (
        ('general', 'General'),
        ('call', 'Call Notes'),
        ('meeting', 'Meeting Notes'),
        ('follow_up', 'Follow Up'),
        ('internal', 'Internal Note'),
    )
    
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='lead_notes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_notes')
    title = models.CharField(max_length=200)
    content = models.TextField()
    note_type = models.CharField(max_length=20, choices=NOTE_TYPES, default='general')
    is_private = models.BooleanField(default=False)
    attachments = models.JSONField(default=list, blank=True)
    
    # ADD THIS FIELD - For follow-up scheduling
    scheduled_date = models.DateTimeField(null=True, blank=True, help_text="Scheduled date for follow-up notes")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.lead.full_name}"