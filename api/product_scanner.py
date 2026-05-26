"""
Vita Nova AI - Product Scanner API
Handles barcode scanning and OCR analysis of product labels
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import os
from config import initialize_gemini, UPLOAD_FOLDER
from utils import save_uploaded_file, clean_json_response, parse_json_response

scanner_bp = Blueprint('scanner', __name__, url_prefix='/api')

# Initialize Gemini model
model = initialize_gemini()


def analyze_product_nutrition(product_data):
    """Analyze product nutrition based on input data"""
    analysis = {
        'health_score': 0,
        'verdict': 'Unknown',
        'nutritional_highlights': [],
        'concerns': [],
        'suggestions': []
    }
    
    health_score = 50  # Start with base score
    
    # Extract values safely
    sugar = product_data.get('sugar', 0)
    fiber = product_data.get('fiber', 0)
    sodium = product_data.get('sodium', 0)
    protein = product_data.get('protein', 0)
    fat = product_data.get('fat', 0)
    calories = product_data.get('calories', 0)
    carbs = product_data.get('carbs', 0)
    
    # Analyze based on product data
    if sugar > 15:
        analysis['concerns'].append('High sugar content (>15g)')
        health_score -= 20
    elif sugar > 8:
        analysis['concerns'].append('Moderate sugar content')
        health_score -= 10
    elif sugar < 5:
        analysis['nutritional_highlights'].append('Low in sugar')
        health_score += 10
    
    if fiber >= 5:
        analysis['nutritional_highlights'].append('Good source of fiber')
        health_score += 15
    elif fiber >= 3:
        analysis['nutritional_highlights'].append('Contains fiber')
        health_score += 8
    
    if sodium < 200:
        analysis['nutritional_highlights'].append('Low sodium')
        health_score += 5
    elif sodium > 600:
        analysis['concerns'].append('High sodium content')
        health_score -= 15
    elif sodium > 350:
        analysis['concerns'].append('Moderate sodium')
        health_score -= 5
    
    if protein >= 10:
        analysis['nutritional_highlights'].append('Excellent protein source')
        health_score += 15
    elif protein >= 5:
        analysis['nutritional_highlights'].append('Good protein content')
        health_score += 8
    
    if calories > 300:
        analysis['concerns'].append('High calorie content')
        health_score -= 10
    elif calories > 150:
        analysis['suggestions'].append('Consume in controlled portions')
    
    if fat > 15:
        analysis['concerns'].append('High fat content')
        health_score -= 12
    elif fat >= 10:
        analysis['concerns'].append('Moderate fat content')
        health_score -= 5
    
    # Check for balance
    if carbs > 30:
        analysis['concerns'].append('High carbohydrate content')
        health_score -= 8
    elif carbs < 10:
        analysis['nutritional_highlights'].append('Low carb option')
        health_score += 5
    
    # Determine verdict
    if health_score >= 75:
        analysis['verdict'] = 'Highly Recommended'
        analysis['verdict_color'] = 'green'
        analysis['suggestions'].append('Excellent choice for regular consumption')
    elif health_score >= 55:
        analysis['verdict'] = 'Recommended'
        analysis['verdict_color'] = 'green'
        analysis['suggestions'].append('Good option for your diet')
    elif health_score >= 35:
        analysis['verdict'] = 'Moderate'
        analysis['verdict_color'] = 'yellow'
        analysis['suggestions'].append('Can be consumed in moderation')
    elif health_score >= 15:
        analysis['verdict'] = 'Limit Consumption'
        analysis['verdict_color'] = 'red'
        analysis['suggestions'].append('Try healthier alternatives')
    else:
        analysis['verdict'] = 'Not Recommended'
        analysis['verdict_color'] = 'red'
        analysis['suggestions'].append('Look for healthier options')
    
    analysis['health_score'] = max(0, min(100, health_score))
    return analysis


def extract_product_nutrition_from_image(filepath):
    """Extract nutrition information from product image using Gemini Vision"""
    if not model:
        return {}
    
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
        Analyze this product label/image. Extract nutritional information you can see.
        Look for: Calories, Protein (g), Sugar (g), Fiber (g), Sodium (mg), Carbs (g), Fat (g).
        If you cannot read exact values, estimate based on typical serving sizes.
        Keep the product name short (1-3 words).
        Return ONLY valid JSON (no markdown, no code blocks):
        {"name": "product name", "calories": number, "protein": number, "sugar": number, "fiber": number, "sodium": number, "carbs": number, "fat": number}
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
            print(f"Failed with GenerationConfig: {config_err}. Retrying...")
            try:
                response = model.generate_content([file_part, prompt])
                content = response.text.strip()
            except Exception as model_err:
                print(f"Failed model call: {model_err}")
                content = "{}"
        
        return parse_json_response(content)
    except Exception as e:
        print(f"Image extraction error: {e}")
        return {}


def get_intelligent_defaults(product_name):
    """Get intelligent nutrition defaults based on product type"""
    name_lower = product_name.lower()
    
    if any(word in name_lower for word in ['chip', 'snack', 'crisp', 'fried']):
        return {
            'calories': 150, 'protein': 2, 'sugar': 1, 'fiber': 1,
            'sodium': 250, 'carbs': 15, 'fat': 9
        }
    elif any(word in name_lower for word in ['noodle', 'maggi', 'maggie', 'ramen', 'pasta', 'spaghetti']):
        return {
            'calories': 380, 'protein': 8, 'sugar': 2, 'fiber': 2,
            'sodium': 900, 'carbs': 58, 'fat': 14
        }
    elif any(word in name_lower for word in ['chocolate', 'candy', 'sweet', 'cookie', 'biscuit', 'cake', 'cocoa']):
        return {
            'calories': 220, 'protein': 3, 'sugar': 24, 'fiber': 1,
            'sodium': 60, 'carbs': 28, 'fat': 11
        }
    elif any(word in name_lower for word in ['soda', 'cola', 'pepsi', 'coke', 'sprite', 'fanta', 'beverage']):
        return {
            'calories': 140, 'protein': 0, 'sugar': 39, 'fiber': 0,
            'sodium': 45, 'carbs': 39, 'fat': 0
        }
    elif any(word in name_lower for word in ['chicken', 'beef', 'egg', 'fish', 'meat', 'tofu', 'protein', 'steak']):
        return {
            'calories': 180, 'protein': 22, 'sugar': 0, 'fiber': 0,
            'sodium': 80, 'carbs': 0, 'fat': 10
        }
    elif any(word in name_lower for word in ['cereal', 'grain', 'oat']):
        return {
            'calories': 150, 'protein': 5, 'sugar': 8, 'fiber': 4,
            'sodium': 200, 'carbs': 28, 'fat': 2
        }
    elif any(word in name_lower for word in ['yogurt', 'milk', 'dairy', 'cheese']):
        return {
            'calories': 100, 'protein': 8, 'sugar': 6, 'fiber': 0,
            'sodium': 75, 'carbs': 12, 'fat': 3
        }
    elif any(word in name_lower for word in ['juice', 'drink']):
        return {
            'calories': 120, 'protein': 0, 'sugar': 28, 'fiber': 0,
            'sodium': 40, 'carbs': 30, 'fat': 0
        }
    elif any(word in name_lower for word in ['fruit', 'apple', 'banana', 'orange', 'salad', 'vegetable']):
        return {
            'calories': 80, 'protein': 1, 'sugar': 15, 'fiber': 3,
            'sodium': 2, 'carbs': 21, 'fat': 0.3
        }
    else:
        # Generic moderate default
        return {
            'calories': 120, 'protein': 4, 'sugar': 5, 'fiber': 2,
            'sodium': 150, 'carbs': 15, 'fat': 5
        }


def extract_key_robustly(data, key_names, default=None):
    """Extract a key from dictionary robustly, handling casing and nested structures"""
    if not isinstance(data, dict):
        return default
    
    # 1. Check direct keys
    for k in key_names:
        if k in data and data[k] is not None:
            return data[k]
            
    # 2. Check nested dictionaries
    for outer_key in ['product', 'product_data', 'nutrition', 'nutrition_facts']:
        if outer_key in data and isinstance(data[outer_key], dict):
            nested = data[outer_key]
            for k in key_names:
                if k in nested and nested[k] is not None:
                    return nested[k]
                    
    return default


def to_int(val, default_val):
    """Convert a value to integer robustly, handling strings with units (e.g. '5g')"""
    if val is None:
        return default_val
    try:
        if isinstance(val, str):
            import re
            numeric_part = re.findall(r'\d+', val)
            if numeric_part:
                return int(numeric_part[0])
        return int(float(val))
    except (ValueError, TypeError):
        return default_val


@scanner_bp.route('/scan-product', methods=['POST'])
def scan_product():
    """Upload and OCR analyze a product label"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        
        # Save file
        filepath, filename = save_uploaded_file(file)
        
        # Extract nutrition from image
        raw_product = extract_product_nutrition_from_image(filepath)
        
        # Build product data with smart defaults and robust key extraction
        name = extract_key_robustly(raw_product, ['name', 'Name', 'product_name', 'productName', 'title'])
        
        # Fallback to cleaned filename if name extraction fails or is too generic
        if not name or name.strip().lower() in ['scanned product', 'unknown', 'product', 'image', 'photo']:
            cleaned_name = None
            if filename:
                name_part = os.path.splitext(filename)[0] if '.' in filename else filename
                # Replace underscores/hyphens/dots with spaces
                name_part = name_part.replace('_', ' ').replace('-', ' ').replace('.', ' ')
                
                # Remove generic suffixes like "label", "front", "back", "package", etc.
                import re
                name_part = re.sub(r'(?i)\b(label|front|back|package|box|wrapper|nutrition|facts|image|photo)\b', '', name_part)
                # Remove trailing/leading numbers or dates
                name_part = re.sub(r'\d+', '', name_part)
                name_part = re.sub(r'\s+', ' ', name_part).strip()
                
                # Check for generic capture names
                name_part_lower = name_part.lower()
                generic_terms = ['camera', 'capture', 'image', 'photo', 'scan', 'product', 'upload', 'screenshot']
                if name_part_lower and not any(gt == name_part_lower or name_part_lower.startswith(gt + ' ') for gt in generic_terms):
                    cleaned_name = name_part.title()
            
            if cleaned_name and len(cleaned_name) >= 2:
                name = cleaned_name
            else:
                name = 'Scanned Product'

        sugar = extract_key_robustly(raw_product, ['sugar', 'Sugar', 'sugars', 'Sugars'])
        fiber = extract_key_robustly(raw_product, ['fiber', 'Fiber', 'dietary_fiber'])
        sodium = extract_key_robustly(raw_product, ['sodium', 'Sodium', 'salt'])
        protein = extract_key_robustly(raw_product, ['protein', 'Protein', 'prot'])
        calories = extract_key_robustly(raw_product, ['calories', 'Calories', 'cal', 'energy'])
        carbs = extract_key_robustly(raw_product, ['carbs', 'Carbs', 'carbohydrates', 'Carbohydrates'])
        fat = extract_key_robustly(raw_product, ['fat', 'Fat', 'fats', 'Fats', 'total_fat'])
        
        # If no meaningful data, use intelligent defaults
        if not any([sugar is not None, fiber is not None, sodium is not None, protein is not None, calories is not None]):
            defaults = get_intelligent_defaults(name)
            product_data = {
                'name': name,
                'calories': defaults['calories'],
                'protein': defaults['protein'],
                'sugar': defaults['sugar'],
                'fiber': defaults['fiber'],
                'sodium': defaults['sodium'],
                'carbs': defaults['carbs'],
                'fat': defaults['fat']
            }
        else:
            # Use extracted values with fallbacks
            product_data = {
                'name': name,
                'calories': to_int(calories, 120),
                'protein': to_int(protein, 4),
                'sugar': to_int(sugar, 5),
                'fiber': to_int(fiber, 2),
                'sodium': to_int(sodium, 150),
                'carbs': to_int(carbs, 15),
                'fat': to_int(fat, 5)
            }

        # Analyze product nutrition
        analysis = analyze_product_nutrition(product_data)
        
        try:
            with open(r"C:\Users\hp\.gemini\antigravity\brain\d839718b-c8fa-49ab-97a9-bae4ac2f7367\scratch\debug_scan.log", "a", encoding="utf-8") as f:
                f.write(f"\n--- SCAN {datetime.now().isoformat()} ---\n")
                f.write(f"filename: {filename}\n")
                f.write(f"raw_product: {raw_product}\n")
                f.write(f"product_data: {product_data}\n")
                f.write(f"analysis: {analysis}\n")
        except Exception as log_err:
            print(f"Failed to write to debug file: {log_err}")
        
        return jsonify({
            'success': True,
            'product': product_data,
            'analysis': analysis,
            'extracted_text': 'Analyzed by Gemini Vision API',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"[DEBUG] scan_product Exception: {e}")
        return jsonify({'error': str(e)}), 500



@scanner_bp.route('/analyze-product', methods=['POST'])
def analyze_product():
    """Analyze grocery product from JSON data"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract product data robustly
        product_data = {
            'name': data.get('name') or data.get('product_name') or 'Unknown Product',
            'sugar': to_int(data.get('sugar'), 5),
            'fiber': to_int(data.get('fiber'), 2),
            'sodium': to_int(data.get('sodium'), 200),
            'protein': to_int(data.get('protein'), 5),
            'calories': to_int(data.get('calories'), 100),
            'carbs': to_int(data.get('carbs'), 15),
            'fat': to_int(data.get('fat'), 5)
        }
        
        # Analyze product
        analysis = analyze_product_nutrition(product_data)
        
        return jsonify({
            'success': True,
            'product': product_data,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
