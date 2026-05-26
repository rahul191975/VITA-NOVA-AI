"""
Vita Nova AI - Utility Functions
Shared utility functions for all features
"""

import json
import os
import mimetypes
from werkzeug.utils import secure_filename
from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS


def clean_json_response(content):
    """Clean markdown code block wrappers from Gemini JSON response"""
    content = content.strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    return content.strip()


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_uploaded_file(file):
    """Save uploaded file and return filepath"""
    if not file or file.filename == '':
        raise ValueError('No file selected')
    
    if not allowed_file(file.filename):
        raise ValueError('File type not allowed')
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    return filepath, filename


def get_file_mime_type(filepath):
    """Get MIME type of file"""
    mime_type = mimetypes.guess_type(filepath)[0] or 'image/jpeg'
    return mime_type


def read_file_as_bytes(filepath):
    """Read file as bytes"""
    with open(filepath, 'rb') as f:
        return f.read()


def parse_json_response(text):
    """Parse JSON response from model"""
    try:
        return json.loads(clean_json_response(text))
    except json.JSONDecodeError:
        return {}
