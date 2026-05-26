"""
Vita Nova AI - Chatbot API
24/7 AI-powered nutrition assistant
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from config import initialize_gemini

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api')

# Initialize Gemini model
model = initialize_gemini()


def get_ai_response(user_message):
    """Generate AI chatbot response based on user message using Gemini"""
    if not model:
        return "Gemini API Key not configured. Please configure it in .env"
        
    try:
        prompt = f"""System: You are Vita Nova AI, an expert nutrition assistant. Provide correct, scientifically accurate, and extremely short, concise answers about diet, nutrition, and health management. Keep your response under 3 sentences.
User: {user_message}"""
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Chatbot Error: {e}")
        # Fallback responses
        message_lower = user_message.lower()
        if 'diet' in message_lower:
            return "A balanced diet is key to good health! Include plenty of vegetables, lean proteins, whole grains, and healthy fats."
        if 'diabetes' in message_lower:
            return "For diabetes management: focus on low-glycemic foods, control portions, and monitor carbohydrates."
        if 'weight' in message_lower or 'lose' in message_lower:
            return "To maintain healthy weight: eat whole foods, control portions, exercise regularly, and stay hydrated."
        if 'exercise' in message_lower:
            return "Exercise is crucial! Aim for 150 minutes of moderate activity weekly plus strength training twice a week."
        if 'nutrition' in message_lower or 'nutrient' in message_lower:
            return "Essential nutrients include proteins, carbs, fats, vitamins, and minerals. A varied diet ensures proper nutrition."
        return "I'm currently running in fast offline mode due to an API quota error. Please ask basic questions about diet or nutrition!"


@chatbot_bp.route('/chat', methods=['POST'])
def chat():
    """Chatbot endpoint - AI nutrition assistant"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400
        
        user_message = data['message']
        
        # Validate message
        if not user_message.strip():
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Generate AI response
        ai_response = get_ai_response(user_message)
        
        return jsonify({
            'success': True,
            'user_message': user_message,
            'ai_response': ai_response,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@chatbot_bp.route('/chat/suggestions', methods=['GET'])
def get_chat_suggestions():
    """Get suggested questions for chatbot"""
    suggestions = [
        "What makes a balanced diet?",
        "How can I manage diabetes with diet?",
        "What foods are good for weight loss?",
        "How much water should I drink daily?",
        "What are the best protein sources?",
        "How can I reduce sodium intake?",
        "What is a healthy BMI range?",
        "How to lower cholesterol naturally?"
    ]
    
    return jsonify({
        'success': True,
        'suggestions': suggestions,
        'timestamp': datetime.now().isoformat()
    })
