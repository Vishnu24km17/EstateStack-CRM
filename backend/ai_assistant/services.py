import json
import logging
from django.conf import settings
from django.utils import timezone
from leads.models import Lead, LeadActivity
from notes.models import Note
from properties.models import Property, Competitor

logger = logging.getLogger(__name__)

class AIService:
    
    @staticmethod
    def get_lead_stats(user):
        """Get lead statistics for a user"""
        if user.role == 'admin':
            leads = Lead.objects.all()
        else:
            leads = Lead.objects.filter(assigned_to=user)
        
        total = leads.count()
        new_count = leads.filter(status='new').count()
        contacted = leads.filter(status='contacted').count()
        qualified = leads.filter(status='qualified').count()
        proposal = leads.filter(status='proposal').count()
        negotiation = leads.filter(status='negotiation').count()
        won = leads.filter(status='won').count()
        lost = leads.filter(status='lost').count()
        
        recent_leads = leads.order_by('-created_at')[:5]
        
        return {
            'total': total,
            'new': new_count,
            'contacted': contacted,
            'qualified': qualified,
            'proposal': proposal,
            'negotiation': negotiation,
            'won': won,
            'lost': lost,
            'recent_leads': recent_leads,
            'leads': leads
        }

    @staticmethod
    def chat_with_lead_data(query, user):
        """Intelligent chatbot that answers all CRM questions"""
        
        query = query.strip()
        if not query:
            return "Please enter a question."
        
        query_lower = query.lower()
        stats = AIService.get_lead_stats(user)
        
        # If no leads
        if stats['total'] == 0:
            return "📭 **No leads found!** Go to the Leads page and add your first lead. I'll help you track everything once you have leads."
        
        # ============================================
        # 1. FOLLOW-UP QUESTIONS (Based on Notes)
        # ============================================
        if any(word in query_lower for word in ['follow-up', 'followup', 'follow up', 'reminder', 'todo', 'to do']):
            # Get today's date
            today = timezone.now().date()
            
            # Get follow-up notes with scheduled dates
            followups = Note.objects.filter(
                user=user,
                note_type='follow_up',
                scheduled_date__isnull=False
            ).order_by('scheduled_date')[:10]
            
            # Also check for notes with scheduled_date in general
            upcoming_notes = Note.objects.filter(
                user=user,
                scheduled_date__isnull=False,
                scheduled_date__gte=timezone.now()
            ).order_by('scheduled_date')[:5]
            
            result = "📋 **Follow-ups & Reminders:**\n\n"
            
            if followups.exists():
                result += "**📌 Follow-up Notes:**\n"
                for note in followups:
                    date_str = note.scheduled_date.strftime('%d %b %Y, %I:%M %p') if note.scheduled_date else 'No date'
                    result += f"• **{note.title}** - {note.lead.full_name}\n"
                    result += f"  📅 {date_str}\n"
                    result += f"  📝 {note.content[:80]}...\n\n"
            else:
                result += "**📌 Follow-up Notes:** None found\n\n"
            
            # Check for upcoming scheduled notes
            if upcoming_notes.exists():
                result += "**⏰ Upcoming Scheduled Notes:**\n"
                for note in upcoming_notes:
                    date_str = note.scheduled_date.strftime('%d %b %Y, %I:%M %p') if note.scheduled_date else 'No date'
                    result += f"• **{note.title}** - {note.lead.full_name} ({date_str})\n"
            else:
                result += "**⏰ Upcoming Scheduled Notes:** None\n"
            
            # Check for leads with next_action_date
            leads_with_action = Lead.objects.filter(
                next_action_date__isnull=False,
                next_action_date__gte=timezone.now()
            ).order_by('next_action_date')[:5]
            
            if leads_with_action.exists():
                result += "\n**📞 Leads with Next Actions:**\n"
                for lead in leads_with_action:
                    date_str = lead.next_action_date.strftime('%d %b %Y, %I:%M %p') if lead.next_action_date else 'No date'
                    result += f"• **{lead.full_name}** - {lead.status}\n"
                    result += f"  📅 {date_str}\n"
            
            if not followups.exists() and not upcoming_notes.exists() and not leads_with_action.exists():
                result += "\n✅ No pending follow-ups or reminders. Great job staying on top of your leads!"
            
            return result

        # ============================================
        # 2. PROPERTY QUESTIONS
        # ============================================
        elif any(word in query_lower for word in ['property', 'properties', 'inventory', 'available properties']):
            properties = Property.objects.all()
            
            if not properties.exists():
                return "🏠 **Properties:** No properties added yet. Go to the Properties page to add your inventory."
            
            total_props = properties.count()
            available = properties.filter(status='available').count()
            booked = properties.filter(status='booked').count()
            sold = properties.filter(status='sold').count()
            under_construction = properties.filter(status='under_construction').count()
            
            result = f"🏠 **Property Inventory:**\n\n"
            result += f"📊 **Total Properties:** {total_props}\n"
            result += f"🟢 Available: {available}\n"
            result += f"🟡 Booked: {booked}\n"
            result += f"🔴 Sold: {sold}\n"
            result += f"🟠 Under Construction: {under_construction}\n\n"
            
            # Show recent properties
            recent_props = properties.order_by('-created_at')[:3]
            if recent_props.exists():
                result += "**🏡 Recent Properties:**\n"
                for prop in recent_props:
                    result += f"• **{prop.name}** - {prop.property_type}\n"
                    result += f"  ₹{prop.price:,.0f} | {prop.location}, {prop.city}\n"
            
            return result

        # ============================================
        # 3. COMPETITOR QUESTIONS
        # ============================================
        elif any(word in query_lower for word in ['competitor', 'competitors', 'competition', 'rival']):
            competitors = Competitor.objects.all()
            
            if not competitors.exists():
                return "📊 **Competitors:** No competitors added yet. Go to the Competitors page to track your competition."
            
            result = "📊 **Competitor Analysis:**\n\n"
            
            for comp in competitors[:5]:
                # Calculate advantage score
                strengths_count = len(comp.strengths.split(',')) if comp.strengths else 0
                weaknesses_count = len(comp.weaknesses.split(',')) if comp.weaknesses else 0
                advantage_count = len(comp.our_advantage.split(',')) if comp.our_advantage else 0
                score = min(100, (strengths_count * 10 + advantage_count * 15) / (weaknesses_count + 1))
                
                result += f"🏢 **{comp.name}**\n"
                result += f"   Project: {comp.project_name}\n"
                result += f"   Location: {comp.location}\n"
                result += f"   Price: {comp.price_range}\n"
                result += f"   Status: {comp.status}\n"
                result += f"   Our Advantage: {comp.our_advantage[:60]}...\n"
                result += f"   📊 Advantage Score: {min(100, int(score))}%\n\n"
            
            return result

        # ============================================
        # 4. LEAD STATS QUESTIONS
        # ============================================
        elif any(word in query_lower for word in ['total', 'how many', 'count', 'all leads']):
            return f"📊 **You have {stats['total']} leads** in your pipeline."

        elif any(word in query_lower for word in ['conversion', 'rate', 'percentage']):
            rate = round((stats['won'] / stats['total']) * 100, 1) if stats['total'] > 0 else 0
            return f"📈 **Your conversion rate is {rate}%**\n\nWon: {stats['won']} out of {stats['total']} leads."

        elif any(word in query_lower for word in ['won', 'closed', 'converted', 'success']):
            if stats['won'] > 0:
                return f"✅ **Won Leads:** {stats['won']}\n\n🎉 Great job! You've successfully converted {stats['won']} leads."
            else:
                return "📊 **Won Leads:** 0\n\nKeep working on your leads. Focus on negotiation and proposal stages to close more deals!"

        elif any(word in query_lower for word in ['lost', 'failed']):
            if stats['lost'] > 0:
                return f"❌ **Lost Leads:** {stats['lost']}\n\nReview these leads to understand what went wrong."
            else:
                return "✅ **Lost Leads:** 0\n\nGreat! You haven't lost any leads yet."

        elif any(word in query_lower for word in ['new', 'fresh']):
            if stats['new'] > 0:
                return f"🆕 **New Leads:** {stats['new']}\n\n📞 These leads need immediate attention. Contact them today!"
            else:
                return "📊 **New Leads:** 0\n\nNo new leads at the moment."

        elif any(word in query_lower for word in ['qualified', 'quality', 'hot']):
            if stats['qualified'] > 0:
                return f"🔥 **Qualified Leads:** {stats['qualified']}\n\nThese are your best opportunities! Follow up with them this week."
            else:
                return "📊 **Qualified Leads:** 0\n\nWork on qualifying your new and contacted leads."

        elif any(word in query_lower for word in ['negotiation', 'negotiating']):
            if stats['negotiation'] > 0:
                return f"💼 **Negotiation Leads:** {stats['negotiation']}\n\n💰 These leads are close to closing!"
            else:
                return "📊 **Negotiation Leads:** 0\n\nMove your proposal leads into negotiation."

        elif any(word in query_lower for word in ['proposal']):
            if stats['proposal'] > 0:
                return f"📄 **Proposal Leads:** {stats['proposal']}\n\nFollow up with these leads to move them to negotiation."
            else:
                return "📊 **Proposal Leads:** 0\n\nSend proposals to your qualified leads."

        elif any(word in query_lower for word in ['breakdown', 'status', 'distribution']):
            return f"""
📊 **Lead Status Breakdown:**

- 🆕 New: {stats['new']}
- 📞 Contacted: {stats['contacted']}
- 🔥 Qualified: {stats['qualified']}
- 📄 Proposal: {stats['proposal']}
- 💼 Negotiation: {stats['negotiation']}
- ✅ Won: {stats['won']}
- ❌ Lost: {stats['lost']}

**Total: {stats['total']} leads**
"""

        # ============================================
        # 5. RECOMMENDATIONS
        # ============================================
        elif any(word in query_lower for word in ['recommend', 'suggest', 'advice', 'should', 'next', 'priority']):
            recommendations = []
            
            if stats['new'] > 0:
                recommendations.append(f"📞 **Contact {stats['new']} new leads** - They're fresh and likely to convert.")
            
            if stats['qualified'] > 0:
                recommendations.append(f"🔥 **Follow up with {stats['qualified']} qualified leads** - They're ready to move forward.")
            
            if stats['proposal'] > 0:
                recommendations.append(f"📄 **Follow up on {stats['proposal']} proposals** - Push them to decision.")
            
            if stats['negotiation'] > 0:
                recommendations.append(f"💼 **Close {stats['negotiation']} negotiation leads** - They're almost there!")
            
            if stats['contacted'] > 0:
                recommendations.append(f"📞 **Schedule follow-ups for {stats['contacted']} contacted leads** - Keep them engaged.")
            
            if stats['won'] > 0:
                recommendations.append(f"🌟 **Ask {stats['won']} won leads for referrals** - Happy customers bring more business.")
            
            if not recommendations:
                recommendations.append("📊 **Focus on lead generation** - Add more leads to your pipeline.")
            
            return "💡 **My Recommendations:**\n\n" + "\n\n".join(recommendations)

        # ============================================
        # 6. HELP / MENU
        # ============================================
        elif any(word in query_lower for word in ['help', 'menu', 'what can you do', 'capabilities']):
            return """
🤖 **CRM Assistant - Available Commands:**

📊 **Lead Stats:**
- "How many leads do I have?"
- "Show me my won leads"
- "What's my conversion rate?"
- "Show lead breakdown"

🔍 **Specific Status:**
- "Show new leads"
- "Show qualified leads"
- "Show lost leads"
- "Show negotiation leads"

📋 **Follow-ups:**
- "What leads need follow-up today?"
- "Show me my follow-ups"
- "Upcoming reminders"

🏠 **Properties:**
- "Show me properties"
- "How many properties are available?"
- "Property inventory"

📊 **Competitors:**
- "Show me competitors"
- "Competitor analysis"
- "Who are my competitors?"

💡 **Recommendations:**
- "What should I do next?"
- "Give me recommendations"
- "Which leads to prioritize?"

Type any question and I'll help!
"""

        # ============================================
        # 7. SHOW LEADS BY STATUS
        # ============================================
        elif any(word in query_lower for word in ['show', 'list', 'display']):
            status_map = {
                'new': stats['new'],
                'contacted': stats['contacted'],
                'qualified': stats['qualified'],
                'proposal': stats['proposal'],
                'negotiation': stats['negotiation'],
                'won': stats['won'],
                'lost': stats['lost']
            }
            
            for status, count in status_map.items():
                if status in query_lower and count > 0:
                    leads = Lead.objects.filter(status=status)
                    if user.role != 'admin':
                        leads = leads.filter(assigned_to=user)
                    result = f"📋 **{status.capitalize()} Leads ({count}):**\n\n"
                    for lead in leads[:5]:
                        result += f"• {lead.full_name} - {lead.email}\n"
                    if count > 5:
                        result += f"\n... and {count - 5} more"
                    return result
            
            return f"📊 **Total Leads:** {stats['total']}\n\nTry asking: 'Show new leads' or 'Show qualified leads'"

        # ============================================
        # 8. DEFAULT RESPONSE
        # ============================================
        else:
            return f"""
🤔 I'm not sure about that question.

📊 **Here's your lead summary:**
- Total: {stats['total']}
- 🆕 New: {stats['new']}
- 📞 Contacted: {stats['contacted']}
- 🔥 Qualified: {stats['qualified']}
- 📄 Proposal: {stats['proposal']}
- 💼 Negotiation: {stats['negotiation']}
- ✅ Won: {stats['won']}
- ❌ Lost: {stats['lost']}

💡 **Try asking:**
- "How many leads do I have?"
- "Show me won leads"
- "What should I do next?"
- "Lead breakdown"
- "Show me competitors"
- "What leads need follow-up today?"
- "Help" for all commands
"""

    @staticmethod
    def enrich_and_score_lead(lead):
        """Simple lead scoring"""
        score = 50
        status_scores = {
            'new': 60,
            'contacted': 70,
            'qualified': 80,
            'proposal': 85,
            'negotiation': 90,
            'won': 100,
            'lost': 10,
        }
        score = status_scores.get(lead.status, 50)
        lead.score = min(score, 100)
        lead.save()
        return lead

    @staticmethod
    def generate_lead_summary(lead):
        """Simple lead summary"""
        return f"""
📋 **Lead: {lead.full_name}**
📧 {lead.email} | 📱 {lead.phone}
🏢 {lead.company or 'N/A'}
📊 Status: {lead.status} | Score: {lead.score}
"""

    @staticmethod
    def get_lead_recommendations(user):
        """Simple recommendations"""
        if user.role == 'admin':
            leads = Lead.objects.all()
        else:
            leads = Lead.objects.filter(assigned_to=user)
        
        leads = leads.order_by('-score')[:5]
        
        if not leads:
            return "No leads found. Start adding leads!"
        
        result = "📋 **Top Leads to Focus On:**\n\n"
        for i, lead in enumerate(leads, 1):
            result += f"{i}. **{lead.full_name}** - {lead.status} (Score: {lead.score})\n"
        
        result += "\n💡 **Action:** Contact your top 3 leads today!"
        return result