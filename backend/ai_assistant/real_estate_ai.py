import google.generativeai as genai
import json
from django.conf import settings
from django.utils import timezone

class RealEstateAI:
    """AI features specifically for real estate CRM"""
    
    @staticmethod
    def get_client():
        api_key = getattr(settings, 'GOOGLE_GEMINI_API_KEY', None)
        if not api_key:
            return None
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-1.5-flash')
    
    @staticmethod
    def generate_lead_summary(lead):
        """Generate AI summary for a lead"""
        model = RealEstateAI.get_client()
        if not model:
            return "AI service not available"
        
        prompt = f"""
        Generate a professional lead summary for a luxury real estate salesperson:
        
        Customer: {lead.first_name} {lead.last_name}
        Phone: {lead.phone}
        Email: {lead.email}
        Occupation: {lead.occupation or 'Not specified'}
        
        Property Preferences:
        - Type: {lead.property_type or 'Any'}
        - Location: {lead.preferred_location or 'Any'}
        - Budget: {lead.budget_min} - {lead.budget_max}
        - Bedrooms: {lead.bedrooms or 'Any'}
        - Timeline: {lead.possession_timeline or 'Not specified'}
        - Purpose: {lead.purpose or 'Any'}
        
        Lead Status: {lead.status}
        Lead Source: {lead.source}
        Score: {lead.score}
        
        Provide:
        1. Key insights about this lead
        2. What makes them a high-potential buyer
        3. Specific recommendations for the salesperson
        4. Suggested next action
        
        Keep it concise and actionable.
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    @staticmethod
    def generate_email(lead, email_type='follow_up'):
        """Generate personalized email for a lead"""
        model = RealEstateAI.get_client()
        if not model:
            return "AI service not available"
        
        email_templates = {
            'follow_up': "Follow-up email after initial contact",
            'site_visit': "Site visit confirmation and details",
            'proposal': "Proposal or offer email",
            'festival': "Festival greetings with property offer",
        }
        
        prompt = f"""
        Write a professional, warm, and personalized email for a luxury real estate salesperson.
        
        Customer: {lead.first_name} {lead.last_name}
        Email Type: {email_templates.get(email_type, 'General email')}
        Property Interest: {lead.property_type or 'Premium Properties'}
        Budget Range: {lead.budget_min} - {lead.budget_max}
        
        Tone: Professional, warm, luxury brand voice
        
        The email should:
        1. Address the customer by name
        2. Reference their property preference
        3. Include a clear call to action
        4. End with a professional signature
        
        Write the complete email.
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating email: {str(e)}"
    
    @staticmethod
    def generate_whatsapp_reply(customer_query):
        """Generate WhatsApp reply for customer queries"""
        model = RealEstateAI.get_client()
        if not model:
            return "AI service not available"
        
        prompt = f"""
        Customer asked: "{customer_query}"
        
        Generate a professional, warm WhatsApp reply for a luxury real estate salesperson.
        
        The reply should:
        1. Address the customer's question directly
        2. Be warm and professional
        3. Include a call to action
        4. Be concise (under 100 words)
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"
    
    @staticmethod
    def get_next_best_action(lead):
        """AI recommends next best action for the lead"""
        model = RealEstateAI.get_client()
        if not model:
            return "AI service not available"
        
        prompt = f"""
        Based on this lead's status and data, recommend the next best action:
        
        Customer: {lead.first_name} {lead.last_name}
        Status: {lead.status}
        Last Contacted: {lead.last_contacted or 'Never'}
        Score: {lead.score}
        
        Recommended Action: [Provide specific, actionable recommendation]
        Reason: [Why this action]
        Expected Outcome: [What to expect]
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"
    
    @staticmethod
    def get_market_insights(competitors, properties):
        """Generate competitive insights for dashboard"""
        model = RealEstateAI.get_client()
        if not model:
            return {"insights": "AI service not available", "recommendations": []}
        
        competitor_data = "\n".join([
            f"- {c.name}: {c.our_advantage}" for c in competitors[:5]
        ])
        
        property_data = "\n".join([
            f"- {p.name}: ₹{p.price} ({p.location})" for p in properties[:5]
        ])
        
        prompt = f"""
        Analyze this real estate market data and provide strategic insights:
        
        Competitors:
        {competitor_data}
        
        Our Properties:
        {property_data}
        
        Provide:
        1. Key market insights (3-4 bullet points)
        2. Our competitive advantages
        3. Recommendations for sales strategy
        4. Areas for improvement
        
        Format as JSON with keys: insights, advantages, recommendations, improvements
        """
        
        try:
            response = model.generate_content(prompt)
            # Try to parse JSON
            try:
                return json.loads(response.text)
            except:
                return {"insights": response.text, "recommendations": []}
        except Exception as e:
            return {"insights": f"Error: {str(e)}", "recommendations": []}