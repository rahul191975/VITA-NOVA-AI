"""
Vita Nova AI - Unified Document Analyzer API
Implements unified analysis for medical reports, product labels, and diet requests
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import os
from config import initialize_gemini, UPLOAD_FOLDER
from utils import save_uploaded_file

unified_analysis_bp = Blueprint('unified_analysis', __name__, url_prefix='/api')

# Initialize Gemini model
model = initialize_gemini()


def perform_ocr_on_file(filepath):
    """Extract raw text and info from uploaded files using Gemini Vision"""
    if not model:
        return "Offline Mode - No OCR text extracted."

    try:
        import mimetypes
        mime_type = mimetypes.guess_type(filepath)[0] or 'image/jpeg'
        with open(filepath, 'rb') as f:
            raw_data = f.read()

        file_part = {
            'mime_type': mime_type,
            'data': raw_data
        }

        # Detailed prompt to extract OCR and semantic text layout
        prompt = """
        Analyze this image or document. Extract all readable text, tables, nutrition facts, 
        ingredient lists, patient info, and medical metrics. Maintain formatting and layout.
        """
        response = model.generate_content([file_part, prompt])
        return response.text.strip()
    except Exception as e:
        print(f"OCR Extraction Error: {e}")
        return f"[OCR Error extracting content from file: {str(e)}]"


@unified_analysis_bp.route('/analyze-doc', methods=['POST'])
def analyze_document():
    """Unified endpoint to analyze health documents and product labels"""
    try:
        # Check if form data or JSON is submitted
        is_json = request.is_json
        
        # Helper to get parameter from JSON or Form Data
        def get_param(name, default="N/A"):
            if is_json:
                return request.json.get(name, default)
            return request.form.get(name, default)

        # Parse demographics & user data
        user_name = get_param('user_name', 'User')
        age = get_param('age', 'N/A')
        gender = get_param('gender', 'N/A')
        weight = get_param('weight', 'N/A')
        height = get_param('height', 'N/A')
        goal = get_param('goal', 'N/A')
        conditions = get_param('conditions', 'N/A')
        diet_type = get_param('diet_type', 'N/A')
        scan_type = get_param('scan_type', 'product_scan')
        
        # Extracted Data
        ocr_text_or_json_data = ""
        file_extracted = ""

        # Check for uploaded file
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename != '':
                # Save file
                filepath, filename = save_uploaded_file(file)
                # Perform OCR using Gemini Vision
                file_extracted = perform_ocr_on_file(filepath)
                ocr_text_or_json_data += f"--- Extracted from file ({filename}) ---\n{file_extracted}\n"

        # Check for direct text input
        direct_text = get_param('ocr_text_or_json_data', '')
        if direct_text and direct_text.strip() != '':
            ocr_text_or_json_data += f"\n--- Provided Text Input ---\n{direct_text}\n"

        # If absolutely no data is provided
        if not ocr_text_or_json_data.strip():
            ocr_text_or_json_data = "{No data provided}"

        # Construct the exact prompt requested by the user
        system_prompt = f"""You are Vita Nova AI, an advanced AI health and nutrition assistant.

Your job is to analyze uploaded product labels, food ingredient lists, nutrition facts, blood reports, medical reports, and health-related documents accurately using the extracted OCR text and structured data provided by the system.

IMPORTANT RULES:
- Never give generic or prewritten answers.
- Always analyze the actual extracted values and ingredients.
- If data is unclear or missing, clearly mention uncertainty.
- Do not hallucinate medical facts.
- Give practical and personalized recommendations.
- Keep responses professional, structured, and easy to understand.
- Do not diagnose diseases.
- Mention when a doctor consultation may be needed.

-----------------------------------
USER DATA
-----------------------------------
Name: {user_name}
Age: {age}
Gender: {gender}
Weight: {weight}
Height: {height}
Goal: {goal}
Medical Conditions: {conditions}
Diet Preference: {diet_type}

-----------------------------------
SCAN TYPE
-----------------------------------
{scan_type}

Possible values:
- product_scan
- blood_report
- health_report
- diet_planner

-----------------------------------
EXTRACTED DATA
-----------------------------------
{ocr_text_or_json_data}

-----------------------------------
TASKS
-----------------------------------

IF scan_type = product_scan:
1. Identify product type
2. Analyze ingredients carefully
3. Detect harmful ingredients:
   - excess sugar
   - trans fat
   - preservatives
   - artificial colors
   - high sodium
4. Give:
   - Health Score (/10)
   - Benefits
   - Risks
   - Suitable For
   - Avoid If
   - Better Alternatives
5. Explain in simple language

IF scan_type = blood_report OR health_report:
1. Identify abnormal values
2. Compare values with normal ranges
3. Explain possible health concerns
4. Suggest:
   - diet improvements
   - hydration
   - exercise
   - sleep improvements
5. Mention severity level:
   - Normal
   - Mild Concern
   - Moderate Concern
   - High Concern
6. Recommend doctor consultation if needed

IF scan_type = diet_planner:
1. Create personalized diet plan
2. Consider:
   - calorie needs
   - fitness goals
   - medical conditions
   - food preferences
3. Include:
   - breakfast
   - lunch
   - dinner
   - snacks
4. Give healthy habits and hydration tips

-----------------------------------
OUTPUT FORMAT
-----------------------------------

Return response in clean markdown format.

Example sections:
# Analysis
# Health Score
# Risks
# Recommendations
# Diet Suggestions
# Conclusion

-----------------------------------
CONFIDENCE SYSTEM
-----------------------------------

At the end include:
Confidence Level: XX%

Reason:
- image clarity
- missing values
- incomplete ingredient list
- OCR quality

If OCR data is unreadable, say:
"Unable to analyze accurately due to unclear scan. Please upload a clearer image."

-----------------------------------
IMPORTANT
-----------------------------------
Never generate fake medical claims.
Never provide random generic advice.
Base every conclusion on the extracted data only.
"""

        # Generate response from Gemini
        if not model:
            # Offline mock mode
            analysis_text = f"""# Analysis
This is an offline simulation of Vita Nova AI. Gemini API Key is missing.

# Health Score
N/A

# Risks
Cannot analyze without API Key.

# Recommendations
Please configure the GEMINI_API_KEY in your .env file.

Confidence Level: 0%
Reason:
- image clarity: Offline
- missing values: API key missing
- incomplete ingredient list: Offline
- OCR quality: Offline
"""
        else:
            response = model.generate_content(system_prompt)
            analysis_text = response.text.strip()

        return jsonify({
            'success': True,
            'analysis': analysis_text,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        print(f"Unified Analysis Error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
