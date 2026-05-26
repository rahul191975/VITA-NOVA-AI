"""
Vita Nova AI - Diet Plan Generation API
Handles personalized diet plan creation based on health data
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import json
from config import initialize_gemini
from utils import clean_json_response, parse_json_response

diet_plan_bp = Blueprint('diet_plan', __name__, url_prefix='/api')

# Initialize Gemini model
model = initialize_gemini()


def generate_diet_plan(health_profile):
    """Generate personalized diet plan based on health profile using Gemini"""
    if not model:
        return {
            'title': 'Fallback Diet Plan',
            'duration': '7 days',
            'daily_calories': 2000,
            'macros': {'protein': '30%', 'carbs': '40%', 'fats': '30%'},
            'meals': [
                {'day': 'Monday', 'breakfast': 'Oatmeal', 'lunch': 'Chicken Salad', 'dinner': 'Salmon', 'snacks': 'Apple'},
                {'day': 'Tuesday', 'breakfast': 'Eggs', 'lunch': 'Tuna Salad', 'dinner': 'Steak', 'snacks': 'Nuts'},
                {'day': 'Wednesday', 'breakfast': 'Yogurt', 'lunch': 'Wrap', 'dinner': 'Tofu Stir-fry', 'snacks': 'Berries'},
                {'day': 'Thursday', 'breakfast': 'Smoothie', 'lunch': 'Soup', 'dinner': 'Chicken', 'snacks': 'Carrots'},
                {'day': 'Friday', 'breakfast': 'Pancakes', 'lunch': 'Quinoa', 'dinner': 'Fish', 'snacks': 'Almonds'}
            ],
            'tips': ['Drink water', 'Add API Key for real AI generation!']
        }
        
    prompt = f"""
    Generate a 5-day personalized diet plan for someone with these metrics:
    Data: {json.dumps(health_profile)}
    Return ONLY a raw JSON object with this exact schema, NO markdown formatting.
    Keep the diet plan highly practical, correct, and extremely brief. 
    Each meal description (breakfast, lunch, dinner, snacks) MUST be short and concise, at most 5 words.
    Include at most 3 health tips, each under 10 words.
    Generate 5 items in the meals array (Monday to Friday):
    {{
        "title": "string (brief e.g., 'Diabetes Control Plan')",
        "duration": "5 days",
        "daily_calories": number,
        "macros": {{"protein": "string", "carbs": "string", "fats": "string"}},
        "meals": [
            {{"day": "string", "breakfast": "string", "lunch": "string", "dinner": "string", "snacks": "string"}}
        ],
        "tips": ["string"]
    }}
    """
    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        return parse_json_response(content)
    except Exception as e:
        print(f"Diet Plan Generation Error: {e}")
        # Fast Fallback
        return {
            'title': 'Offline Mode Diet Plan',
            'duration': '5 days',
            'daily_calories': 2000,
            'macros': {'protein': '30%', 'carbs': '40%', 'fats': '30%'},
            'meals': [
                {'day': 'Monday', 'breakfast': 'Oatmeal', 'lunch': 'Chicken Salad', 'dinner': 'Salmon', 'snacks': 'Apple'},
                {'day': 'Tuesday', 'breakfast': 'Eggs', 'lunch': 'Tuna Salad', 'dinner': 'Steak', 'snacks': 'Nuts'},
                {'day': 'Wednesday', 'breakfast': 'Yogurt', 'lunch': 'Wrap', 'dinner': 'Tofu Stir-fry', 'snacks': 'Berries'},
                {'day': 'Thursday', 'breakfast': 'Smoothie', 'lunch': 'Soup', 'dinner': 'Chicken', 'snacks': 'Carrots'},
                {'day': 'Friday', 'breakfast': 'Pancakes', 'lunch': 'Quinoa', 'dinner': 'Fish', 'snacks': 'Almonds'}
            ],
            'tips': ['Drink water', 'API Quota Exceeded - Using Fast Offline Mode']
        }


@diet_plan_bp.route('/diet-plan', methods=['POST'])
def diet_plan():
    """Generate personalized diet plan"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Generate diet plan
        plan = generate_diet_plan(data)
        
        return jsonify({
            'success': True,
            'plan': plan,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@diet_plan_bp.route('/diet-plan-template', methods=['GET'])
def get_diet_plan_template():
    """Get diet plan template"""
    return jsonify({
        'success': True,
        'template': {
            'title': 'Your Personal Diet Plan',
            'duration': '5 days',
            'daily_calories': 2000,
            'macros': {'protein': '30%', 'carbs': '40%', 'fats': '30%'},
            'meals': [],
            'tips': []
        },
        'timestamp': datetime.now().isoformat()
    })
