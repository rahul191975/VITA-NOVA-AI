"""
Vita Nova AI - Configuration Module
Centralized configuration for the application
"""

import os
import tempfile
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# API Configuration
API_KEY = os.getenv('GEMINI_API_KEY')

# Flask Configuration
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'vita_nova_uploads')
ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg', 'png', 'txt', 'docx'}

# Gemini Model
GEMINI_MODEL = 'gemini-2.5-flash-lite'

# Feature flags
FEATURES = {
    'medical_report_analysis': True,
    'product_scanning': True,
    'chatbot': True,
    'diet_planning': True,
    'health_analytics': True
}

# Health metrics defaults
DEFAULT_HEALTH_DATA = {
    'blood_sugar': 120,
    'blood_pressure': '130/85',
    'cholesterol': 210,
    'triglycerides': 180,
    'BMI': 26.5,
    'age': 45,
    'gender': 'Male'
}

# Initialize Gemini API
def initialize_gemini():
    """Initialize and return Gemini model"""
    try:
        import google.generativeai as genai
        if API_KEY:
            genai.configure(api_key=API_KEY)
            return genai.GenerativeModel(GEMINI_MODEL)
        return None
    except Exception as e:
        print(f"Error initializing Gemini: {e}")
        return None

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
