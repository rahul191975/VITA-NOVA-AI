"""
Vita Nova AI - Medical Report Analysis API
Handles medical report uploads and health data extraction
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import os
import mimetypes
from config import initialize_gemini, DEFAULT_HEALTH_DATA
from utils import save_uploaded_file, clean_json_response, parse_json_response

medical_report_bp = Blueprint('medical_report', __name__, url_prefix='/api')

# Initialize Gemini model
model = initialize_gemini()


def extract_health_data(filename):
    """Extract health data from uploaded file using Gemini Vision"""
    from config import UPLOAD_FOLDER
    
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    if not model:
        return DEFAULT_HEALTH_DATA.copy()
    
    try:
        import mimetypes
        mime_type = mimetypes.guess_type(filepath)[0] or 'image/jpeg'
        with open(filepath, 'rb') as f:
            raw_data = f.read()
            
        file_part = {
            'mime_type': mime_type,
            'data': raw_data
        }
        
        prompt = """
        Analyze this medical report. Extract the following health metrics if available. 
        Return ONLY a raw JSON object with this exact schema, NO markdown formatting:
        {
            "blood_sugar": number (or 120 if missing),
            "blood_pressure": "string e.g. 130/85" (or "130/85" if missing),
            "cholesterol": number (or 210 if missing),
            "triglycerides": number (or 180 if missing),
            "BMI": number (or 26.5 if missing),
            "age": number (or 45 if missing),
            "gender": "string" (or "Male" if missing)
        }
        """
        try:
            import google.generativeai as genai
            response = model.generate_content(
                [file_part, prompt],
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            content = response.text.strip()
        except Exception as config_err:
            print(f"Failed with GenerationConfig: {config_err}. Retrying without generation_config...")
            try:
                response = model.generate_content([file_part, prompt])
                content = response.text.strip()
            except Exception as model_err:
                print(f"Failed model call: {model_err}")
                content = "{}"
        
        try:
            raw_data = json.loads(clean_json_response(content))
        except:
            raw_data = {}
            
        health_data = {
            'blood_sugar': raw_data.get('blood_sugar') or raw_data.get('Blood_sugar') or 120,
            'blood_pressure': raw_data.get('blood_pressure') or raw_data.get('Blood_pressure') or "130/85",
            'cholesterol': raw_data.get('cholesterol') or raw_data.get('Cholesterol') or 210,
            'triglycerides': raw_data.get('triglycerides') or raw_data.get('Triglycerides') or 180,
            'BMI': raw_data.get('BMI') or raw_data.get('bmi') or 26.5,
            'age': raw_data.get('age') or raw_data.get('Age') or 45,
            'gender': raw_data.get('gender') or raw_data.get('Gender') or "Male"
        }
        return health_data
    except Exception as e:
        print(f"Extraction Error: {e}")
        return DEFAULT_HEALTH_DATA.copy()


def generate_health_assessment(health_data):
    """Generate health assessment based on extracted data using Gemini"""
    if not model:
        return {
            'overall_health': 'Moderate',
            'risk_areas': ['API Key missing'],
            'recommendations': ['Please add your Gemini API Key']
        }
        
    prompt = f"""
    Analyze these health metrics and provide a health assessment.
    Data: {json.dumps(health_data)}
    Return ONLY a raw JSON object with this exact schema, NO markdown formatting.
    Be extremely brief and concise. List at most 3 key risk areas (short, under 8 words each) and at most 3 actionable recommendations (short, under 10 words each).
    {{
        "overall_health": "string (Excellent, Good, Moderate, Poor)",
        "risk_areas": ["string"],
        "recommendations": ["string"]
    }}
    """
    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        return json.loads(clean_json_response(content))
    except Exception as e:
        print(f"Assessment Error: {e}")
        return {
            'overall_health': 'Moderate',
            'risk_areas': ['Pre-diabetes/Diabetes risk', 'High blood pressure'],
            'recommendations': ['Reduce sugar', 'Reduce sodium', 'API Quota Exceeded - Using Offline Mode']
        }


@medical_report_bp.route('/upload-report', methods=['POST'])
def upload_report():
    """Upload and analyze medical report"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Save file
        filepath, filename = save_uploaded_file(file)
        
        # Extract health data from file
        health_data = extract_health_data(filename)
        
        # Generate assessment
        assessment = generate_health_assessment(health_data)
        
        # Generate diet plan (import from diet_plan module)
        from .diet_plan import generate_diet_plan
        diet_plan = generate_diet_plan(health_data)
        
        return jsonify({
            'success': True,
            'message': 'File analyzed successfully',
            'filename': filename,
            'health_data': health_data,
            'assessment': assessment,
            'diet_plan': diet_plan,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@medical_report_bp.route('/health-data', methods=['GET'])
def get_health_data():
    """Get default health data template"""
    return jsonify({
        'success': True,
        'health_data': DEFAULT_HEALTH_DATA.copy(),
        'timestamp': datetime.now().isoformat()
    })
