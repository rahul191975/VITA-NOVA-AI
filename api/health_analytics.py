"""
Vita Nova AI - Health Analytics API
Tracks and analyzes health metrics and provides insights
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from config import DEFAULT_HEALTH_DATA

health_analytics_bp = Blueprint('health_analytics', __name__, url_prefix='/api')


def calculate_health_score(health_data):
    """Calculate overall health score based on health metrics"""
    score = 100  # Start with perfect score
    
    # Blood Sugar Analysis (100 is normal)
    bs = health_data.get('blood_sugar', 100)
    if bs < 70 or bs > 200:
        score -= 20
    elif bs < 80 or bs > 150:
        score -= 10
    
    # Blood Pressure Analysis (120/80 is normal)
    try:
        bp = health_data.get('blood_pressure', '120/80')
        sys, dia = map(int, bp.split('/'))
        if sys > 140 or dia > 90:
            score -= 20
        elif sys > 130 or dia > 85:
            score -= 10
    except:
        pass
    
    # Cholesterol Analysis (<200 is desirable)
    chol = health_data.get('cholesterol', 200)
    if chol > 240:
        score -= 20
    elif chol > 200:
        score -= 10
    
    # BMI Analysis (18.5-24.9 is normal)
    bmi = health_data.get('BMI', 22)
    if bmi < 18.5 or bmi > 29.9:
        score -= 15
    elif bmi < 18.5 or bmi > 24.9:
        score -= 5
    
    # Triglycerides (<150 is normal)
    trig = health_data.get('triglycerides', 150)
    if trig > 200:
        score -= 15
    elif trig > 150:
        score -= 5
    
    return max(0, min(100, score))


def get_health_recommendations(health_data):
    """Generate personalized health recommendations"""
    recommendations = []
    warnings = []
    
    # Blood Sugar Analysis
    bs = health_data.get('blood_sugar', 100)
    if bs > 126:
        warnings.append('High blood sugar levels - monitor for diabetes risk')
        recommendations.append('Reduce refined carbohydrates and sugar intake')
        recommendations.append('Increase fiber intake and physical activity')
    elif bs < 70:
        warnings.append('Low blood sugar levels - consult doctor')
    
    # Blood Pressure Analysis
    try:
        bp = health_data.get('blood_pressure', '120/80')
        sys, dia = map(int, bp.split('/'))
        if sys > 140 or dia > 90:
            warnings.append('High blood pressure - consult healthcare provider')
            recommendations.append('Reduce sodium intake')
            recommendations.append('Exercise regularly and manage stress')
    except:
        pass
    
    # Cholesterol Analysis
    chol = health_data.get('cholesterol', 200)
    if chol > 240:
        warnings.append('High cholesterol levels - increase monitoring')
        recommendations.append('Limit saturated fats and trans fats')
        recommendations.append('Increase soluble fiber intake')
    
    # BMI Analysis
    bmi = health_data.get('BMI', 22)
    if bmi > 25:
        warnings.append('Overweight - maintain healthy weight')
        recommendations.append('Engage in regular physical activity')
        recommendations.append('Follow a calorie-controlled diet')
    elif bmi < 18.5:
        warnings.append('Underweight - consult nutritionist')
        recommendations.append('Increase calorie and protein intake')
    
    # Triglycerides Analysis
    trig = health_data.get('triglycerides', 150)
    if trig > 200:
        warnings.append('High triglycerides - lifestyle modifications needed')
        recommendations.append('Reduce refined sugars')
        recommendations.append('Limit alcohol consumption')
    
    # Default recommendations
    if not recommendations:
        recommendations = [
            'Maintain a balanced diet with fruits and vegetables',
            'Exercise at least 150 minutes per week',
            'Stay hydrated and get adequate sleep',
            'Regular health check-ups'
        ]
    
    return {
        'warnings': list(set(warnings))[:3],  # Top 3 unique warnings
        'recommendations': list(set(recommendations))[:5]  # Top 5 unique recommendations
    }


def get_health_metrics_interpretation(metric_name, value):
    """Get interpretation of specific health metric"""
    interpretations = {
        'blood_sugar': {
            'normal': '<100 mg/dL (fasting)',
            'prediabetes': '100-125 mg/dL',
            'diabetes': '>126 mg/dL',
            'low': '<70 mg/dL (hypoglycemia)'
        },
        'blood_pressure': {
            'normal': '<120/80 mmHg',
            'elevated': '120-129/<80 mmHg',
            'high_stage1': '130-139/80-89 mmHg',
            'high_stage2': '≥140/≥90 mmHg'
        },
        'cholesterol': {
            'desirable': '<200 mg/dL',
            'borderline_high': '200-239 mg/dL',
            'high': '≥240 mg/dL'
        },
        'BMI': {
            'underweight': '<18.5',
            'normal': '18.5-24.9',
            'overweight': '25-29.9',
            'obese': '≥30'
        },
        'triglycerides': {
            'normal': '<150 mg/dL',
            'borderline_high': '150-199 mg/dL',
            'high': '200-499 mg/dL',
            'very_high': '≥500 mg/dL'
        }
    }
    
    return interpretations.get(metric_name, {'info': 'Metric not found'})


@health_analytics_bp.route('/health-check', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Vita Nova AI Backend',
        'timestamp': datetime.now().isoformat()
    })


@health_analytics_bp.route('/analyze-health', methods=['POST'])
def analyze_health():
    """Analyze health data and provide insights"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Calculate health score
        health_score = calculate_health_score(data)
        
        # Get recommendations
        recommendations = get_health_recommendations(data)
        
        return jsonify({
            'success': True,
            'health_score': health_score,
            'score_category': 'Excellent' if health_score >= 80 else 'Good' if health_score >= 60 else 'Moderate' if health_score >= 40 else 'Poor',
            'health_data': data,
            'warnings': recommendations['warnings'],
            'recommendations': recommendations['recommendations'],
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@health_analytics_bp.route('/metrics-interpretation/<metric_name>', methods=['GET'])
def get_metric_interpretation(metric_name):
    """Get interpretation of specific health metric"""
    try:
        interpretation = get_health_metrics_interpretation(metric_name)
        
        return jsonify({
            'success': True,
            'metric': metric_name,
            'interpretation': interpretation,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@health_analytics_bp.route('/health-report', methods=['POST'])
def generate_health_report():
    """Generate comprehensive health report"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        health_score = calculate_health_score(data)
        recommendations = get_health_recommendations(data)
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'overall_score': health_score,
            'metrics': data,
            'analysis': {
                'blood_sugar': get_metric_interpretation('blood_sugar', data.get('blood_sugar')),
                'blood_pressure': get_metric_interpretation('blood_pressure', data.get('blood_pressure')),
                'cholesterol': get_metric_interpretation('cholesterol', data.get('cholesterol')),
                'BMI': get_metric_interpretation('BMI', data.get('BMI')),
                'triglycerides': get_metric_interpretation('triglycerides', data.get('triglycerides'))
            },
            'warnings': recommendations['warnings'],
            'recommendations': recommendations['recommendations'],
            'next_checkup': 'In 3 months'
        }
        
        return jsonify({
            'success': True,
            'report': report,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
