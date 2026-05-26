# 🏥 Vita Nova AI - AI-Powered Healthcare Diet Planner

An intelligent healthcare application that combines Gemini AI with modern web technology to provide personalized diet planning, grocery scanning, and health analysis.

## ✨ Features

### 🥗 AI Diet Plan Generator
- Personalized meal plans based on your health data
- Customizable dietary preferences
- Weekly meal planning with calorie tracking
- Macro nutrient balance optimization

### 📱 Grocery Barcode Scanner
- Real-time product barcode scanning via camera
- Instant nutritional information extraction
- AI-powered health scoring system
- Product recommendations based on health goals

### 📸 Product OCR Analysis
- Upload product images for AI analysis
- Automatic nutrition facts extraction
- Health impact assessment
- Ingredient analysis and allergen detection

### 📋 Medical Report Upload & Analysis
- Upload medical reports (PDF/Images)
- AI-powered health metrics extraction
- Comprehensive health assessment
- Personalized recommendations based on health data

### 🤖 AI Nutrition Chatbot
- 24/7 AI assistant for nutrition queries
- Powered by Google Gemini API
- Context-aware responses
- Multi-language support

### 📊 Health Analytics
- Complete health metrics tracking
- Risk assessment and analysis
- Progress monitoring
- Health score calculation

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- Google Gemini API Key (get it from [ai.google.dev](https://ai.google.dev))
- Modern web browser
- Node.js (optional, for build tools)

### Installation

1. **Clone the repository**
```bash
cd "d:\VITA NOVA\bita nova ai 2"
```

2. **Create Python virtual environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure API Keys**
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your Gemini API Key
# GEMINI_API_KEY=your_api_key_here
```

5. **Run the Flask Backend**
```bash
python backend.py
```

The backend will start on `http://localhost:5000`

6. **Open the Frontend**
- Open `index.html` in your web browser, or
- Use a local server:
```bash
# Python 3
python -m http.server 8000

# Then visit http://localhost:8000
```

## 📚 API Endpoints

### Health Check
- `GET /api/health` - Check backend status

### Report Analysis
- `POST /api/upload-report` - Upload and analyze medical report
- Returns: Health metrics, assessment, and diet plan

### Product Scanning
- `POST /api/scan-product` - OCR analyze product label
- `POST /api/analyze-product` - Analyze product data

### Chatbot
- `POST /api/chat` - Send message to AI assistant

### Diet Planning
- `POST /api/diet-plan` - Generate personalized diet plan

### Health Scoring
- `POST /api/health-score` - Calculate health score
- `GET /api/get-features` - Get all feature details

### Usage Tracking
- `POST /api/track-feature` - Track feature usage

## 🔧 Project Structure

```
vita nova ai 2/
├── index.html           # Main UI
├── script.js           # Frontend interactivity
├── style.css           # Styling (purple & peach theme)
├── api-integration.js  # API communication layer
├── backend.py          # Flask backend with Gemini integration
├── requirements.txt    # Python dependencies
├── .env.example        # Environment template
└── README.md           # This file
```

## 🎨 Design Features

- **Modern UI** with glass-morphism design
- **Purple & Peach** color scheme
- **Responsive Design** for all devices
- **Dark Mode Ready** color system
- **Smooth Animations** and transitions
- **Interactive Elements** with hover effects

## 🤖 AI Integration

All features leverage Google's **Gemini 2.5 Flash** API:

1. **Vision Analysis** - Analyze medical reports and product images
2. **Text Understanding** - Extract health data and nutritional info
3. **Natural Language** - Provide intelligent responses
4. **JSON Response** - Structured data output

## 🛠️ Configuration

### Gemini API Setup

1. Visit [ai.google.dev](https://ai.google.dev)
2. Sign in with your Google account
3. Create an API key
4. Add it to your `.env` file:
```env
GEMINI_API_KEY=your_key_here
```

### CORS Configuration

The backend is configured with CORS enabled for local development.
Update the CORS settings in `backend.py` if deploying to production.

## 📦 Dependencies

- **Flask** - Web framework
- **Flask-CORS** - CORS support
- **google-generativeai** - Gemini API client
- **python-dotenv** - Environment management
- **requests** - HTTP library

## 🚀 Deployment

### Local Development
```bash
python backend.py
```

### Production Deployment (Example with Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend:app
```

## 🔒 Security Notes

1. **Never commit** `.env` file with real API keys
2. **Use environment variables** for sensitive data
3. **Validate file uploads** on backend
4. **Implement rate limiting** for production
5. **Use HTTPS** for deployment
6. **Sanitize user input** from chatbot

## 🐛 Troubleshooting

### Gemini API Key Error
- Verify API key is correct
- Check internet connection
- Ensure API quota is available

### File Upload Issues
- Check file size (max 16MB)
- Supported formats: PDF, JPG, PNG, DOCX
- Verify upload folder permissions

### Camera Access Denied
- Grant camera permissions in browser
- Check browser security settings
- Use HTTPS for camera access in production

### CORS Errors
- Ensure backend is running
- Check API_BASE_URL in script
- Verify CORS is enabled in backend.py

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API error messages
3. Check browser console for errors
4. Verify all files are in correct location

## 📄 License

This project is open source and available for educational and personal use.

## 🙏 Credits

Built with:
- Google Gemini AI
- Flask Framework
- Font Awesome Icons
- Poppins Font
- Modern CSS3

## 🎯 Roadmap

- [ ] Mobile app version
- [ ] Database integration
- [ ] User accounts and history
- [ ] Recipe suggestions
- [ ] Grocery delivery integration
- [ ] Wearable device integration
- [ ] Multi-language support
- [ ] Video tutorials

## ⚡ Quick Start Command

```bash
# 1. Setup
cd "d:\VITA NOVA\bita nova ai 2"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Gemini API Key

# 2. Run Backend
python backend.py

# 3. Open Frontend
# Open index.html in your browser
```

---

**Vita Nova AI** - Your Personal AI Health Assistant 🌟
