"""
Vita Nova AI - API Modules Package
Feature-based API endpoints
"""

from .medical_report import medical_report_bp
from .product_scanner import scanner_bp
from .chatbot import chatbot_bp
from .diet_plan import diet_plan_bp
from .health_analytics import health_analytics_bp
from .unified_analysis import unified_analysis_bp

__all__ = [
    'medical_report_bp',
    'scanner_bp',
    'chatbot_bp',
    'diet_plan_bp',
    'health_analytics_bp',
    'unified_analysis_bp'
]
