from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta, datetime
from leads.models import Lead, LeadActivity
from notes.models import Note
from accounts.models import User, LoginActivity

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get leads based on user role
        if user.role == 'admin':
            leads = Lead.objects.all()
        elif user.role == 'manager':
            leads = Lead.objects.filter(Q(assigned_to=user) | Q(created_by=user))
        else:
            leads = Lead.objects.filter(assigned_to=user)
        
        # Basic stats
        total_leads = leads.count()
        new_leads = leads.filter(status='new', created_at__date=timezone.now().date()).count()
        won_leads = leads.filter(status='won').count()
        lost_leads = leads.filter(status='lost').count()
        
        # Conversion rate
        conversion_rate = 0
        if total_leads > 0:
            conversion_rate = (won_leads / total_leads) * 100
        
        # Revenue estimation
        avg_project_value = 5000000
        estimated_revenue = won_leads * avg_project_value
        
        # Lead status distribution
        status_distribution = leads.values('status').annotate(count=Count('id'))
        
        # Priority distribution
        priority_distribution = leads.values('priority').annotate(count=Count('id'))
        
        # Recent leads
        recent_leads = leads.order_by('-created_at')[:10].values(
            'id', 'first_name', 'last_name', 'status', 'priority', 'created_at'
        )
        
        # Get recent login activity
        login_activities = LoginActivity.objects.select_related('user').order_by('-login_time')[:10]
        
        login_activity_data = []
        for activity in login_activities:
            login_activity_data.append({
                'user': activity.user.username,
                'user_id': activity.user.id,
                'first_name': activity.user.first_name,
                'last_name': activity.user.last_name,
                'login_time': activity.login_time,
                'is_active': activity.user.is_active,
                'ip_address': activity.ip_address,
            })
        
        # Get latest notes
        latest_notes = Note.objects.filter(
            user=request.user
        ).order_by('-created_at')[:5].values(
            'id', 'title', 'content', 'lead_id', 'created_at', 'note_type', 'scheduled_date'
        )
        
        for note in latest_notes:
            try:
                lead = Lead.objects.get(id=note['lead_id'])
                note['lead_name'] = lead.full_name
            except Lead.DoesNotExist:
                note['lead_name'] = 'Unknown Lead'
        
        # UPCOMING FOLLOW-UPS - From Notes with follow_up type and scheduled_date
        upcoming_followups = []
        
        # Get follow-ups from Notes with follow_up type
        note_followups = Note.objects.filter(
            user=user,
            note_type='follow_up'
        ).exclude(
            scheduled_date__isnull=True
        ).filter(
            scheduled_date__gte=timezone.now()
        ).order_by('scheduled_date')[:10]
        
        for note in note_followups:
            try:
                lead = Lead.objects.get(id=note.lead_id)
                upcoming_followups.append({
                    'id': note.id,
                    'lead_id': note.lead_id,
                    'lead_name': lead.full_name,
                    'description': note.content,
                    'title': note.title,
                    'scheduled_date': note.scheduled_date,
                    'note_type': note.note_type,
                    'source': 'note'
                })
            except Lead.DoesNotExist:
                pass
        
        # Also get from LeadActivity for backward compatibility
        activity_followups = LeadActivity.objects.filter(
            user=user,
            is_completed=False,
            scheduled_date__gte=timezone.now()
        ).order_by('scheduled_date')[:5]
        
        for followup in activity_followups:
            try:
                lead = Lead.objects.get(id=followup.lead_id)
                upcoming_followups.append({
                    'id': followup.id,
                    'lead_id': followup.lead_id,
                    'lead_name': lead.full_name,
                    'description': followup.description,
                    'scheduled_date': followup.scheduled_date,
                    'activity_type': followup.activity_type,
                    'source': 'activity'
                })
            except Lead.DoesNotExist:
                pass
        
        # Sort by scheduled date and limit to 5
        upcoming_followups.sort(key=lambda x: x['scheduled_date'])
        upcoming_followups = upcoming_followups[:5]
        
        # TODAY'S ACTIVITY - Count leads created today by hour (UTC)
        now = timezone.now()
        today = now.date()
        hourly_activity = []
        current_hour = now.hour
        
        # Get all leads created today
        today_leads = leads.filter(created_at__date=today)
        
        for hour in range(0, 24):
            count = today_leads.filter(
                created_at__hour=hour
            ).count()
            
            is_future = hour > current_hour
            
            hourly_activity.append({
                'hour': f"{hour:02d}:00",
                'count': count,
                'is_future': is_future
            })
        
        # THIS WEEK - Daily breakdown (Monday to Sunday)
        week_start = today - timedelta(days=today.weekday())
        weekly_activity = []
        for i in range(7):
            date = week_start + timedelta(days=i)
            count = leads.filter(created_at__date=date).count()
            is_today = date == today
            weekly_activity.append({
                'day': date.strftime('%a'),
                'date': date.strftime('%d/%m'),
                'count': count,
                'is_today': is_today
            })
        
        # THIS MONTH - Daily breakdown for the month
        month_start = today.replace(day=1)
        if today.month == 12:
            next_month = today.replace(year=today.year + 1, month=1, day=1)
        else:
            next_month = today.replace(month=today.month + 1, day=1)
        days_in_month = (next_month - month_start).days
        
        monthly_activity = []
        for i in range(days_in_month):
            date = month_start + timedelta(days=i)
            count = leads.filter(created_at__date=date).count()
            is_today = date == today
            monthly_activity.append({
                'day': date.strftime('%d'),
                'date': date.strftime('%d/%m'),
                'count': count,
                'is_today': is_today,
                'day_name': date.strftime('%a')
            })
        
        return Response({
            'total_leads': total_leads,
            'new_leads_today': new_leads,
            'won_leads': won_leads,
            'lost_leads': lost_leads,
            'conversion_rate': round(conversion_rate, 2),
            'estimated_revenue': estimated_revenue,
            'status_distribution': status_distribution,
            'priority_distribution': priority_distribution,
            'recent_leads': recent_leads,
            'login_activity': login_activity_data,
            'latest_notes': latest_notes,
            'upcoming_followups': upcoming_followups,
            'daily_activity': hourly_activity,
            'weekly_activity': weekly_activity,
            'monthly_activity': monthly_activity,
        })