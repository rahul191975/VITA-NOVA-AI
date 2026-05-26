"""
Vita Nova AI - Backend
AI-powered healthcare diet planning and grocery analysis
Python Flask API with Modular Feature-Based Architecture
"""

from flask import Flask
from flask_cors import CORS
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Load configuration from config module
from config import UPLOAD_FOLDER, FEATURES, initialize_gemini

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Enable CORS
CORS(app)

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize Gemini model
model = initialize_gemini()

# ============================================
# Register API Blueprints
# ============================================

from api import (
    medical_report_bp,
    scanner_bp,
    chatbot_bp,
    diet_plan_bp,
    health_analytics_bp,
    unified_analysis_bp
)

# Register blueprints
app.register_blueprint(medical_report_bp)
app.register_blueprint(scanner_bp)
app.register_blueprint(chatbot_bp)
app.register_blueprint(diet_plan_bp)
app.register_blueprint(health_analytics_bp)
app.register_blueprint(unified_analysis_bp)

# ============================================
# System Status Endpoints
# ============================================

from flask import jsonify

@app.route('/api/system/status', methods=['GET'])
def system_status():
    """Get system status and available features"""
    from config import FEATURES, GEMINI_MODEL
    
    return jsonify({
        'status': 'operational',
        'service': 'Vita Nova AI Backend',
        'version': '2.0',
        'features': FEATURES,
        'model': GEMINI_MODEL,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint matching frontend call"""
    return jsonify({
        'status': 'healthy',
        'service': 'Vita Nova AI Backend',
        'timestamp': datetime.now().isoformat()
    })



@app.route('/api/features', methods=['GET'])
def get_features():
    """Get list of available features"""
    from config import FEATURES
    
    features_list = [
        {
            'id': 'medical_report',
            'name': 'Medical Report Analysis',
            'description': 'Upload and analyze medical reports',
            'endpoint': '/api/upload-report',
            'enabled': FEATURES.get('medical_report_analysis', True)
        },
        {
            'id': 'scanner',
            'name': 'Product Scanner',
            'description': 'Scan and analyze product labels',
            'endpoints': ['/api/scan-product', '/api/analyze-product'],
            'enabled': FEATURES.get('product_scanning', True)
        },
        {
            'id': 'chatbot',
            'name': 'AI Nutrition Chatbot',
            'description': '24/7 AI-powered nutrition assistant',
            'endpoint': '/api/chat',
            'enabled': FEATURES.get('chatbot', True)
        },
        {
            'id': 'diet_plan',
            'name': 'Diet Plan Generation',
            'description': 'Generate personalized diet plans',
            'endpoint': '/api/diet-plan',
            'enabled': FEATURES.get('diet_planning', True)
        },
        {
            'id': 'health_analytics',
            'name': 'Health Analytics',
            'description': 'Track and analyze health metrics',
            'endpoints': ['/api/analyze-health', '/api/health-report', '/api/metrics-interpretation/<metric>'],
            'enabled': FEATURES.get('health_analytics', True)
        }
    ]
    
    return jsonify({
        'success': True,
        'features': features_list,
        'timestamp': datetime.now().isoformat()
    })


# ============================================
# Error Handlers
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'status': 404,
        'timestamp': datetime.now().isoformat()
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error',
        'status': 500,
        'timestamp': datetime.now().isoformat()
    }), 500


@app.route('/api/health-score', methods=['POST'])
def health_score():
    """Calculate health score based on parameters"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Calculate score (0-100)
        score = 75  # Base score
        
        if data.get('blood_sugar', 0) > 126:
            score -= 15
        if data.get('bmi', 0) > 25:
            score -= 10
        if data.get('blood_pressure', 0) > 130:
            score -= 10
        if data.get('cholesterol', 0) > 200:
            score -= 10
        
        score = max(0, min(100, score))
        
        verdict = 'Excellent' if score >= 80 else 'Good' if score >= 60 else 'Fair' if score >= 40 else 'Poor'
        
        return jsonify({
            'success': True,
            'score': score,
            'verdict': verdict,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/track-feature', methods=['POST'])
def track_feature():
    """Track feature view/usage"""
    try:
        data = request.get_json()
        
        if not data or 'feature_name' not in data:  
            return jsonify({'error': 'No feature name provided'}), 400
        
        feature_name = data['feature_name']
        
        # Log feature view
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Feature accessed: {feature_name}")
        
        return jsonify({
            'success': True,
            'feature_name': feature_name,
            'tracked_at': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-features', methods=['GET'])
def get_features_detailed():
    """Get all features with details"""
    try:
        features = [
            {
                'id': 0,
                'name': 'AI Diet Plan Generator',
                'icon': 'fas fa-utensils',
                'description': 'Personalized meal plans based on your health data and preferences',
                'details': 'Our advanced AI analyzes your health metrics, dietary restrictions, and preferences to create customized weekly meal plans tailored specifically for you.',
                'features': ['Weekly meal plans', 'Calorie tracking', 'Dietary restrictions', 'Macro tracking', 'Shopping lists', 'Recipe suggestions']
            },
            {
                'id': 1,
                'name': 'Grocery Barcode Scanner',
                'icon': 'fas fa-barcode',
                'description': 'Scan products instantly to get nutritional information',
                'details': 'Simply scan a product barcode using your camera to instantly access detailed nutrition facts, health ratings, and personalized recommendations.',
                'features': ['Barcode scanning', 'Instant nutrition facts', 'Health ratings', 'Allergen warnings', 'Price comparison', 'Health alternatives']
            },
            {
                'id': 2,
                'name': 'Product OCR Analysis',
                'icon': 'fas fa-camera',
                'description': 'Extract nutrition facts from product labels using AI',
                'details': 'Upload a photo of any product label and our AI will automatically extract and analyze the nutrition information for you.',
                'features': ['Image to text', 'Auto extraction', 'Nutritional analysis', 'Health scoring', 'Ingredient analysis', 'Allergen detection']
            },
            {
                'id': 3,
                'name': 'Diabetes Report Upload',
                'icon': 'fas fa-file-medical-alt',
                'description': 'Upload medical reports for AI-powered health analysis',
                'details': 'Upload your medical reports (PDF or images) for comprehensive AI analysis with personalized health recommendations.',
                'features': ['PDF upload', 'Image upload', 'Data extraction', 'Health insights', 'Risk assessment', 'Personalized recommendations']
            },
            {
                'id': 4,
                'name': 'AI Health Analysis',
                'icon': 'fas fa-stethoscope',
                'description': 'Comprehensive health insights from your medical data',
                'details': 'Get detailed analysis of your health metrics including blood sugar, cholesterol, BMI, and more with actionable recommendations.',
                'features': ['Health metrics', 'Risk analysis', 'Trend tracking', 'Comparisons', 'Health score', 'Recommendations']
            },
            {
                'id': 5,
                'name': 'Weekly Meal Planner',
                'icon': 'fas fa-calendar-week',
                'description': 'Plan your entire week with balanced nutrition',
                'details': 'Organize your meals for the entire week with balanced nutrition, meal prep guides, and shopping lists all in one place.',
                'features': ['7-day planning', 'Meal prep', 'Shopping lists', 'Recipe links', 'Nutrition balance', 'Cost tracking']
            },
            {
                'id': 6,
                'name': 'Indian Food Recommendations',
                'icon': 'fas fa-pepper-hot',
                'description': 'Localized diet suggestions for Indian cuisine',
                'details': 'Get personalized recommendations based on healthy Indian cuisines with traditional recipes adapted for your health goals.',
                'features': ['Local recipes', 'Traditional dishes', 'Healthy adaptations', 'Regional options', 'Cultural preferences', 'Nutrition balanced']
            },
            {
                'id': 7,
                'name': 'AI Nutrition Chatbot',
                'icon': 'fas fa-robot',
                'description': '24/7 AI assistant for all your nutrition queries',
                'details': 'Chat with our AI nutrition assistant anytime to get instant answers to your health and nutrition questions.',
                'features': ['24/7 availability', 'Instant responses', 'Health queries', 'Personalized advice', 'Multi-language', 'Context aware']
            }
        ]
        
        return jsonify({
            'success': True,
            'features': features,
            'total_features': len(features),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# Error Handlers
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

# ============================================
# Main
# ============================================

if __name__ == '__main__':
    # Create uploads directory
    os.makedirs('uploads', exist_ok=True)
    
    print("=" * 50)
    print("[+] VITA NOVA AI - Backend Started")
    print("=" * 50)
    print("Server: http://127.0.0.1:5000")
    print("API Documentation: http://127.0.0.1:5000/api/features")
    print("=" * 50)
    
    # Run Flask app
    app.run(
        debug=True,
        host='127.0.0.1',
        port=5000,
        threaded=True
    )
