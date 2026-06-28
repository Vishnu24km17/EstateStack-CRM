import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

# Get API key
api_key = os.getenv('GOOGLE_GEMINI_API_KEY')

if not api_key:
    print("❌ GOOGLE_GEMINI_API_KEY not found in .env")
    print("Please add it: GOOGLE_GEMINI_API_KEY=AIzaSy...")
    exit()

try:
    # Initialize the new client
    client = genai.Client(api_key=api_key)
    
    # Use a correct model name: 'gemini-2.0-flash' or 'gemini-1.5-flash'
    model_name = 'gemini-2.0-flash'  # Latest free model
    
    # Test request
    response = client.models.generate_content(
        model=model_name,
        contents="Say 'Hello, CRM is working!' in one sentence."
    )
    print("✅ Gemini is working!")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"❌ Error: {e}")