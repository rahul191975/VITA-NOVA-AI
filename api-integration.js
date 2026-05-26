/**
 * Vita Nova AI - Backend API Integration
 * Connect frontend with Python Flask backend
 */

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// ============================================
// API Helper Functions
// ============================================

/**
 * Generic fetch wrapper for API calls
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

/**
 * Upload file to backend
 */
async function uploadFile(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/upload-report`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('File Upload Error:', error);
        throw error;
    }
}

// ============================================
// Report Upload Integration
// ============================================

/**
 * Analyze medical report via backend
 */
async function analyzeReportViaBackend(file) {
    try {
        const result = await uploadFile(file);
        
        if (result.success) {
            // Display assessment
            displayReportAnalysis(result);
            // Display diet plan
            if (result.diet_plan) {
                displayDietPlan(result.diet_plan);
                // Scroll to diet plan
                const dietSection = document.getElementById('diet');
                if (dietSection) {
                    dietSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
            return result;
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (error) {
        console.warn('Report Analysis Error, falling back to client-side simulation:', error);
        const mockResult = generateMockReportResult(file ? file.name : "medical_report.pdf");
        displayReportAnalysis(mockResult);
        if (mockResult.diet_plan) {
            displayDietPlan(mockResult.diet_plan);
            const dietSection = document.getElementById('diet');
            if (dietSection) {
                dietSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        return mockResult;
    }
}

/**
 * Display report analysis results
 */
function displayReportAnalysis(result) {
    const resultCard = document.getElementById('resultCard');
    if (!resultCard) return;

    const healthData = result.health_data;
    const assessment = result.assessment;

    let htmlContent = `
        <div class="analysis-result">
            <h3>Health Analysis Report</h3>
            
            <div class="health-metrics">
                <h4>Your Health Metrics:</h4>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-label">Blood Sugar:</span>
                        <span class="metric-value">${healthData.blood_sugar} mg/dL</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Blood Pressure:</span>
                        <span class="metric-value">${healthData.blood_pressure}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Cholesterol:</span>
                        <span class="metric-value">${healthData.cholesterol} mg/dL</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">BMI:</span>
                        <span class="metric-value">${healthData.BMI}</span>
                    </div>
                </div>
            </div>

            <div class="assessment-section">
                <h4>Overall Assessment: ${assessment.overall_health}</h4>
                
                ${assessment.risk_areas.length > 0 ? `
                    <div class="risk-areas">
                        <h5>Areas of Concern:</h5>
                        <ul>
                            ${assessment.risk_areas.map(risk => `<li>⚠️ ${risk}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${assessment.recommendations.length > 0 ? `
                    <div class="recommendations">
                        <h5>Our Recommendations:</h5>
                        <ul>
                            ${assessment.recommendations.map(rec => `<li>✓ ${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    resultCard.innerHTML = htmlContent;
}

// ============================================
// Product Analysis Integration
// ============================================

/**
 * Analyze product via backend
 */
async function analyzeProductViaBackend(productData) {
    try {
        const result = await apiCall('/analyze-product', 'POST', productData);
        
        if (result.success) {
            displayProductAnalysis(result);
            return result;
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (error) {
        console.warn('Product Analysis Error, falling back to client-side simulation:', error);
        const analysis = analyzeProductNutritionClientSide(productData);
        const mockResult = {
            success: true,
            product: productData,
            analysis: analysis,
            extracted_text: "Client-side simulation fallback"
        };
        displayProductAnalysis(mockResult);
        return mockResult;
    }
}

/**
 * Upload product image for OCR scanning
 */
async function scanProductImageViaBackend(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/scan-product`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            displayProductAnalysis(result);
            return result;
        } else {
            throw new Error(result.error || 'Scan failed');
        }
    } catch (error) {
        console.warn('Scan Error, falling back to client-side simulation:', error);
        const mockResult = getMockProductScanResult(file ? file.name : "product.jpg");
        displayProductAnalysis(mockResult);
        return mockResult;
    }
}

/**
 * Display product analysis results
 */
function displayProductAnalysis(result) {
    const productAnalysis = document.getElementById('productAnalysis');
    if (!productAnalysis) return;

    const analysis = result.analysis || {};
    const product = result.product || {};

    const scoreColor = analysis.verdict_color || 'gray';
    const productName = product.name || product.product_name || product.Name || result.product_name || result.name || 'Scanned Product';
    
    // Extracted robust values
    const calories = product.calories !== undefined ? product.calories : (product.Calories || 0);
    const protein = product.protein !== undefined ? product.protein : (product.Protein || 0);
    const carbs = product.carbs !== undefined ? product.carbs : (product.Carbs || 0);
    const sugar = product.sugar !== undefined ? product.sugar : (product.Sugar || 0);
    const fiber = product.fiber !== undefined ? product.fiber : (product.Fiber || 0);
    const fat = product.fat !== undefined ? product.fat : (product.Fat || 0);
    const sodium = product.sodium !== undefined ? product.sodium : (product.Sodium || 0);

    let htmlContent = `
        <div class="product-analysis-results">
            <div class="product-header">
                <h3>${productName}</h3>
                <div class="health-score-circle ${scoreColor}">
                    <div class="score-value">${analysis.health_score || 0}</div>
                    <div class="score-label">Health Score</div>
                </div>
            </div>

            <div class="verdict-section">
                <span class="verdict-badge ${analysis.verdict_color || 'gray'}">${analysis.verdict || 'Unknown'}</span>
            </div>

            ${analysis.nutritional_highlights && analysis.nutritional_highlights.length > 0 ? `
                <div class="nutritional-section">
                    <h4>✓ Nutritional Highlights:</h4>
                    <ul>
                        ${analysis.nutritional_highlights.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${analysis.concerns && analysis.concerns.length > 0 ? `
                <div class="concerns-section">
                    <h4>⚠️ Concerns:</h4>
                    <ul>
                        ${analysis.concerns.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${analysis.suggestions && analysis.suggestions.length > 0 ? `
                <div class="suggestions-section">
                    <h4>💡 Suggestions:</h4>
                    <ul>
                        ${analysis.suggestions.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="nutrition-facts">
                <h4>Nutritional Information (per serving):</h4>
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <span class="nutrition-label">Calories:</span>
                        <span class="nutrition-value">${calories}</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-label">Protein:</span>
                        <span class="nutrition-value">${protein}g</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-label">Carbs:</span>
                        <span class="nutrition-value">${carbs}g</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-label">Sugar:</span>
                        <span class="nutrition-value">${sugar}g</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-label">Fiber:</span>
                        <span class="nutrition-value">${fiber}g</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-label">Fat:</span>
                        <span class="nutrition-value">${fat}g</span>
                    </div>
                    <div class="nutrition-item">
                        <span class="nutrition-label">Sodium:</span>
                        <span class="nutrition-value">${sodium}mg</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    productAnalysis.innerHTML = htmlContent;
}

// ============================================
// Chatbot Integration
// ============================================

/**
 * Send message to chatbot backend
 */
async function sendChatMessageViaBackend(message) {
    try {
        const result = await apiCall('/chat', 'POST', { message: message });
        
        if (result.success) {
            return result.ai_response;
        } else {
            throw new Error(result.error || 'Chat failed');
        }
    } catch (error) {
        console.warn('Chat Error, falling back to client-side reply:', error);
        return getClientSideChatReply(message);
    }
}

// ============================================
// Diet Plan Integration
// ============================================

/**
 * Generate diet plan via backend
 */
async function generateDietPlanViaBackend(healthProfile) {
    try {
        const result = await apiCall('/diet-plan', 'POST', healthProfile);
        
        if (result.success) {
            displayDietPlan(result.plan);
            return result;
        } else {
            throw new Error(result.error || 'Plan generation failed');
        }
    } catch (error) {
        console.warn('Diet Plan Error, falling back to client-side simulation:', error);
        const mockPlan = generateMockDietPlan(healthProfile);
        displayDietPlan(mockPlan);
        return { success: true, plan: mockPlan };
    }
}

/**
 * Display generated diet plan
 */
function displayDietPlan(plan) {
    const dietPlanSection = document.getElementById('dietPlanResult') || document.querySelector('.diet-plan-container');
    if (!dietPlanSection) return;

    let htmlContent = `
        <div class="diet-plan-display">
            <h3>${plan.title}</h3>
            <p class="plan-duration">Duration: ${plan.duration}</p>

            <div class="macronutrients">
                <h4>Daily Macronutrient Distribution:</h4>
                <div class="macro-grid">
                    <div class="macro-item">
                        <span class="macro-label">Protein</span>
                        <span class="macro-value">${plan.macros.protein}</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-label">Carbs</span>
                        <span class="macro-value">${plan.macros.carbs}</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-label">Fats</span>
                        <span class="macro-value">${plan.macros.fats}</span>
                    </div>
                </div>
            </div>

            <div class="meal-plan">
                <h4>Weekly Meal Plan:</h4>
                ${plan.meals.map(day => `
                    <div class="day-plan">
                        <h5>${day.day}</h5>
                        <div class="meal-item">
                            <span class="meal-type">Breakfast:</span>
                            <span class="meal-name">${day.breakfast}</span>
                        </div>
                        <div class="meal-item">
                            <span class="meal-type">Lunch:</span>
                            <span class="meal-name">${day.lunch}</span>
                        </div>
                        <div class="meal-item">
                            <span class="meal-type">Dinner:</span>
                            <span class="meal-name">${day.dinner}</span>
                        </div>
                        <div class="meal-item">
                            <span class="meal-type">Snacks:</span>
                            <span class="meal-name">${day.snacks}</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="health-tips">
                <h4>Health Tips:</h4>
                <ul>
                    ${plan.tips.map(tip => `<li>• ${tip}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    dietPlanSection.innerHTML = htmlContent;
}

// ============================================
// Health Score Integration
// ============================================

/**
 * Calculate health score via backend
 */
async function calculateHealthScoreViaBackend(healthMetrics) {
    try {
        const result = await apiCall('/health-score', 'POST', healthMetrics);
        
        if (result.success) {
            return {
                score: result.score,
                verdict: result.verdict
            };
        } else {
            throw new Error(result.error || 'Calculation failed');
        }
    } catch (error) {
        console.error('Health Score Error:', error);
        return { score: 0, verdict: 'Error' };
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check backend health status
 */
async function checkBackendHealth() {
    try {
        const response = await apiCall('/health', 'GET');
        console.log('Backend Status:', response);
        return response.status === 'healthy';
    } catch (error) {
        console.error('Backend not available:', error);
        return false;
    }
}

// ============================================
// Initialize Backend Integration
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing Backend Integration...');
    
    // Check if backend is available
    const backendHealthy = await checkBackendHealth();
    if (backendHealthy) {
        console.log('✓ Backend connection established');
    } else {
        console.warn('⚠️ Backend not available - using client-side simulation');
    }
});


// Feature Tracking Integration

/**
 * Track feature view in backend
 */
async function trackFeatureView(featureName) {
    try {
        const result = await apiCall('/track-feature', 'POST', { 
            feature_name: featureName,
            timestamp: new Date().toISOString()
        });
        
        if (result.success) {
            console.log(`✓ Feature tracked: ${featureName}`);
        }
    } catch (error) {
        console.warn('Could not track feature (backend may not support this yet)');
    }
}

// ============================================
// Client-Side Offline Fallbacks (Simulation Mode)
// ============================================

function generateMockReportResult(fileName) {
    return {
        success: true,
        message: "Analyzed via Client-Side Simulation Mode (Offline)",
        filename: fileName,
        health_data: {
            blood_sugar: 115,
            blood_pressure: "125/80",
            cholesterol: 195,
            BMI: 24.2,
            age: 35,
            gender: "Female"
        },
        assessment: {
            overall_health: "Good",
            risk_areas: ["Mild sugar elevation", "Slightly elevated BMI"],
            recommendations: [
                "Incorporate more leafy greens and whole grains",
                "Reduce processed sugars and sweetened beverages",
                "Aim for 150 minutes of moderate exercise per week"
            ]
        },
        diet_plan: generateMockDietPlan({ diet_preference: "Balanced", blood_sugar: 115, BMI: 24.2 })
    };
}

function generateMockDietPlan(healthProfile) {
    const pref = healthProfile.diet_preference || healthProfile.dietPreference || "Balanced";
    const bloodSugar = healthProfile.blood_sugar || healthProfile.bloodSugar || 110;
    const gender = healthProfile.gender || "Male";
    const age = healthProfile.age || 35;
    const bmi = healthProfile.BMI || healthProfile.bmi || 24.2;

    let title = `${pref} Health Plan`;
    let calories = 2000;
    if (pref.includes("Low Carb")) calories = 1600;
    if (pref.includes("Diabetic")) calories = 1500;
    if (bmi > 25) calories = 1700;

    let macros = { protein: "25%", carbs: "45%", fats: "30%" };
    let meals = [];
    let tips = [];

    if (pref.includes("Indian Vegetarian")) {
        title = "Indian Vegetarian Healthy Plan";
        macros = { protein: "20%", carbs: "50%", fats: "30%" };
        meals = [
            { day: "Monday", breakfast: "Moong dal chilla with green chutney", lunch: "Roti, mixed veg sabzi, bowl of dal", dinner: "Paneer bhurji with roti", snacks: "Roasted makhana (foxnuts)" },
            { day: "Tuesday", breakfast: "Vegetable upma with almonds", lunch: "Brown rice, chickpea curry, curd", dinner: "Soya chunks subzi with oats roti", snacks: "Sprouted moong chat" },
            { day: "Wednesday", breakfast: "Sprouted moong chilla", lunch: "Multigrain roti, bhindi subzi, yellow dal", dinner: "Palak paneer with bajra roti", snacks: "Roasted chana (chickpeas)" },
            { day: "Thursday", breakfast: "Oats idli with tomato chutney", lunch: "Vegetable khichdi with cucumber raita", dinner: "Grilled tofu subzi with roti", snacks: "Walnuts & mixed seeds" },
            { day: "Friday", breakfast: "Besan chilla with curd", lunch: "Brown rice, kidney beans (rajma), salad", dinner: "Mixed vegetable soup & paneer tikka", snacks: "Buttermilk (chaas)" }
        ];
        tips = [
            "Use minimal mustard/coconut oil for cooking.",
            "Include buttermilk or curd in lunches for digestion.",
            "Stay active with 30 mins brisk walking."
        ];
    } else if (pref.includes("Vegetarian")) {
        title = "Plant-Based Vegetarian Plan";
        meals = [
            { day: "Monday", breakfast: "Oatmeal with chia seeds & banana", lunch: "Quinoa salad with chickpeas & avocado", dinner: "Lentil soup with whole wheat sourdough", snacks: "Apple slices with almond butter" },
            { day: "Tuesday", breakfast: "Greek yogurt with mixed berries & walnuts", lunch: "Whole wheat wrap with hummus & veggies", dinner: "Stir-fried tofu with broccoli and brown rice", snacks: "Baby carrots & cucumber dip" },
            { day: "Wednesday", breakfast: "Scrambled tofu with spinach & toast", lunch: "Black bean & corn salad bowl", dinner: "Vegetable curry with quinoa", snacks: "Mixed nuts & seeds" },
            { day: "Thursday", breakfast: "Smoothie bowl with plant protein", lunch: "Lentil soup with side salad", dinner: "Baked sweet potato stuffed with beans", snacks: "Cottage cheese & pineapple" },
            { day: "Friday", breakfast: "Avocado toast with hemp seeds", lunch: "Quinoa salad with cucumber and olives", dinner: "Stir-fried mixed veggies with edamame", snacks: "Dark chocolate & almonds" }
        ];
        tips = [
            "Drink plenty of water throughout the day.",
            "Incorporate a protein source in every meal.",
            "Limit processed vegetarian alternatives."
        ];
    } else if (pref.includes("Vegan")) {
        title = "Healthy Vegan Meal Plan";
        macros = { protein: "18%", carbs: "52%", fats: "30%" };
        meals = [
            { day: "Monday", breakfast: "Oatmeal with chia seeds & banana", lunch: "Quinoa salad with chickpeas & avocado", dinner: "Lentil soup with whole wheat bread", snacks: "Apple slices with almond butter" },
            { day: "Tuesday", breakfast: "Soy yogurt with mixed berries & walnuts", lunch: "Whole wheat wrap with hummus & veggies", dinner: "Stir-fried tofu with broccoli and brown rice", snacks: "Baby carrots & hummus" },
            { day: "Wednesday", breakfast: "Scrambled tofu with spinach & toast", lunch: "Black bean & corn salad bowl", dinner: "Vegetable curry with quinoa", snacks: "Mixed nuts & seeds" },
            { day: "Thursday", breakfast: "Smoothie bowl with plant protein", lunch: "Lentil soup with side salad", dinner: "Baked sweet potato stuffed with beans", snacks: "Celery sticks & peanut butter" },
            { day: "Friday", breakfast: "Avocado toast with hemp seeds", lunch: "Quinoa salad with cucumber and olives", dinner: "Stir-fried mixed veggies with edamame", snacks: "Dark chocolate & almonds" }
        ];
        tips = [
            "Supplement with Vitamin B12 if needed.",
            "Focus on whole food plant sources.",
            "Drink at least 2.5 liters of water."
        ];
    } else if (pref.includes("Low Carb")) {
        title = "Low Carb / Keto Energy Plan";
        macros = { protein: "30%", carbs: "15%", fats: "55%" };
        meals = [
            { day: "Monday", breakfast: "Scrambled eggs with butter and avocado", lunch: "Grilled chicken caesar salad (no croutons)", dinner: "Baked salmon with garlic butter broccoli", snacks: "Celery sticks with cream cheese" },
            { day: "Tuesday", breakfast: "Egg muffins with spinach and bacon", lunch: "Tuna salad lettuce wraps", dinner: "Stir-fried beef with zucchini noodles", snacks: "Handful of macadamia nuts" },
            { day: "Wednesday", breakfast: "Omelette with mushrooms and cheese", lunch: "Grilled shrimp salad with olive oil", dinner: "Baked chicken thighs with asparagus", snacks: "Avocado with salt & pepper" },
            { day: "Thursday", breakfast: "Keto smoothie (spinach, avocado, protein)", lunch: "Cobb salad with blue cheese dressing", dinner: "Pork chops with cauliflower mash", snacks: "Olives & cheese cubes" },
            { day: "Friday", breakfast: "Boiled eggs and avocado slices", lunch: "Salmon salad with spinach and walnuts", dinner: "Ribeye steak with buttered green beans", snacks: "Dark chocolate (85%+ cocoa)" }
        ];
        tips = [
            "Monitor electrolyte levels (sodium/potassium).",
            "Focus on healthy fats like extra virgin olive oil.",
            "Keep daily net carbs under 50 grams."
        ];
    } else if (pref.includes("Diabetic")) {
        title = "Diabetic-Friendly Low-GI Plan";
        macros = { protein: "25%", carbs: "40%", fats: "35%" };
        meals = [
            { day: "Monday", breakfast: "Steel-cut oats with cinnamon and walnuts", lunch: "Quinoa and chickpea salad with vinaigrette", dinner: "Baked cod with lemon and garlic broccoli", snacks: "Greek yogurt (unsweetened)" },
            { day: "Tuesday", breakfast: "Egg white spinach omelette with whole wheat toast", lunch: "Turkey breast salad with olive oil", dinner: "Grilled chicken with cauliflower rice & greens", snacks: "Cucumber slices with hummus" },
            { day: "Wednesday", breakfast: "Avocado toast on multigrain bread", lunch: "Lentil vegetable soup with a side salad", dinner: "Baked salmon with roasted asparagus", snacks: "Apple slices with almond butter" },
            { day: "Thursday", breakfast: "Chia pudding made with almond milk & berries", lunch: "Tuna salad wrap in high-fiber tortilla", dinner: "Stir-fried tofu with bell peppers and snow peas", snacks: "Boiled egg & walnuts" },
            { day: "Friday", breakfast: "Scrambled eggs with tomatoes and side spinach", lunch: "Grilled chicken breast over mixed salad greens", dinner: "Baked turkey meatballs with zucchini noodles", snacks: "A handful of almonds" }
        ];
        tips = [
            "Combine carbs with fiber and protein to lower GI impact.",
            "Avoid sugar-sweetened beverages entirely.",
            "Check blood sugar levels regularly."
        ];
    } else {
        // Balanced Diet
        title = "Balanced Clean Eating Diet Plan";
        meals = [
            { day: "Monday", breakfast: "Oatmeal with chia seeds and berries", lunch: "Grilled chicken quinoa bowl", dinner: "Baked salmon with asparagus", snacks: "Mixed nuts & a pear" },
            { day: "Tuesday", breakfast: "Greek yogurt with honey and sliced almonds", lunch: "Turkey and avocado wrap", dinner: "Stir-fried tofu with broccoli and brown rice", snacks: "Baby carrots with hummus" },
            { day: "Wednesday", breakfast: "Scrambled eggs with spinach and whole wheat toast", lunch: "Lentil soup with a side salad", dinner: "Grilled shrimp with roasted sweet potato", snacks: "Apple slices with peanut butter" },
            { day: "Thursday", breakfast: "Banana and protein smoothie", lunch: "Quinoa salad with cucumber and feta", dinner: "Chicken breast with roasted zucchini", snacks: "Cottage cheese with pineapple" },
            { day: "Friday", breakfast: "Avocado toast with a poached egg", lunch: "Tuna salad salad", dinner: "Lean beef stir-fry with mixed vegetables", snacks: "Dark chocolate (70%+) and almonds" }
        ];
        tips = [
            "Hydrate: Drink at least 2.5 liters of water daily.",
            "Meal prep: Cook grains and proteins in bulk to save time.",
            "Mindful eating: Eat slowly and stop when you feel 80% full."
        ];
    }

    return {
        title: title,
        duration: "5 days",
        daily_calories: calories,
        macros: macros,
        meals: meals,
        tips: tips
    };
}

function getMockProductScanResult(fileName) {
    const mockProducts = [
        {
            name: "Whole Grain Rolled Oats",
            calories: 150,
            protein: 5,
            sugar: 1,
            fiber: 4,
            sodium: 0,
            carbs: 27,
            fat: 3
        },
        {
            name: "Hazelnut Chocolate Spread",
            calories: 200,
            protein: 2,
            sugar: 21,
            fiber: 1,
            sodium: 15,
            carbs: 22,
            fat: 11
        },
        {
            name: "Low Fat Greek Yogurt",
            calories: 90,
            protein: 12,
            sugar: 5,
            fiber: 0,
            sodium: 50,
            carbs: 6,
            fat: 2
        }
    ];
    // Select one randomly
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const analysis = analyzeProductNutritionClientSide(product);
    return {
        success: true,
        product: product,
        analysis: analysis,
        extracted_text: "Extracted via Client-Side Simulation Mode (Offline)"
    };
}

function analyzeProductNutritionClientSide(product) {
    let score = 60; // baseline
    let highlights = [];
    let concerns = [];
    let suggestions = [];
    let verdict = "Recommended";
    let color = "green";

    const sugar = product.sugar || 0;
    const fiber = product.fiber || 0;
    const protein = product.protein || 0;
    const fat = product.fat || 0;

    if (sugar > 15) {
        concerns.push("High sugar content");
        score -= 20;
    } else if (sugar < 5) {
        highlights.push("Low in sugar");
        score += 15;
    }

    if (fiber >= 4) {
        highlights.push("Excellent source of fiber");
        score += 15;
    }

    if (protein >= 8) {
        highlights.push("High in protein");
        score += 15;
    }

    if (fat > 10) {
        concerns.push("High fat content");
        score -= 10;
    }

    score = Math.max(0, Math.min(100, score));

    if (score >= 75) {
        verdict = "Highly Recommended";
        color = "green";
        suggestions.push("Excellent choice for a healthy diet.");
    } else if (score >= 55) {
        verdict = "Recommended";
        color = "green";
        suggestions.push("A good choice, enjoy in moderate portions.");
    } else if (score >= 35) {
        verdict = "Moderate";
        color = "yellow";
        suggestions.push("Contains some high-risk ingredients. Consume sparingly.");
    } else {
        verdict = "Not Recommended";
        color = "red";
        suggestions.push("Look for healthier, lower-sugar/fat alternatives.");
    }

    return {
        health_score: score,
        verdict: verdict,
        verdict_color: color,
        nutritional_highlights: highlights,
        concerns: concerns,
        suggestions: suggestions
    };
}

function getClientSideChatReply(message) {
    const msg = message.toLowerCase();
    if (msg.includes("diet") || msg.includes("meal")) {
        return "A balanced diet should focus on clean, whole foods. Try planning your meals around high-quality protein (like fish, eggs, tofu), complex carbohydrates (quinoa, brown rice), and healthy fats (avocado, nuts), along with plenty of leafy greens!";
    }
    if (msg.includes("sugar") || msg.includes("diabet")) {
        return "For diabetes or managing blood sugar, it's best to eat foods with a low glycemic index, control portion sizes, and combine carbohydrates with fiber and protein to slow down glucose absorption.";
    }
    if (msg.includes("indian")) {
        return "Indian cuisine has wonderful healthy options! You can adapt it by using brown rice or millets instead of white rice, whole wheat roti without oil/ghee, focusing on dal (lentils), roasted paneer/chicken, and using minimal oil in subzis.";
    }
    if (msg.includes("cereal") || msg.includes("scan")) {
        return "When scanning foods, look out for hidden sugars (like high-fructose corn syrup) and high sodium levels. Try to choose products with at least 3g of fiber and 5g of protein per serving.";
    }
    return "Hello! I am currently running in client-side fallback mode, but I can still tell you about diet plans, food scanning, diabetes recommendations, and healthy Indian food adaptations. Ask me anything about these!";
}
