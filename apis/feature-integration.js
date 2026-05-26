/**
 * Vita Nova AI - Complete Feature Integration
 * Connects UI to Feature-Based Modular APIs
 */

// ============================================
// API Feature Integration Bridge
// ============================================

const FeatureIntegration = {
    /**
     * Initialize all feature integrations
     */
    async init() {
        console.log('🚀 Initializing Feature Integration...');
        
        // Check API health
        const isHealthy = await checkAPIHealth();
        console.log('✅ API Health:', isHealthy ? 'OPERATIONAL' : 'NOT AVAILABLE');
        
        // Get available features
        const features = await getAvailableFeatures();
        console.log('✅ Available Features:', features.length);
        
        return {
            isHealthy,
            features
        };
    },

    /**
     * FEATURE 1: Medical Report Analysis
     */
    async medicalReport(file) {
        try {
            console.log('📄 Processing Medical Report:', file.name);
            
            const result = await uploadMedicalReport(file);
            
            console.log('✅ Medical Report Analyzed');
            console.log('   - Health Data:', result.data.healthData);
            console.log('   - Assessment:', result.data.assessment);
            console.log('   - Diet Plan:', result.data.dietPlan);
            
            return result;
        } catch (error) {
            console.error('❌ Medical Report Error:', error);
            throw error;
        }
    },

    /**
     * FEATURE 2: Product Scanner
     */
    async productScanner(file) {
        try {
            console.log('📸 Scanning Product:', file.name);
            
            const result = await scanProductFromImage(file);
            
            console.log('✅ Product Scanned');
            console.log('   - Product:', result.product.name);
            console.log('   - Health Score:', result.analysis.health_score);
            console.log('   - Verdict:', result.analysis.verdict);
            
            return result;
        } catch (error) {
            console.error('❌ Product Scanner Error:', error);
            throw error;
        }
    },

    /**
     * FEATURE 3: AI Chatbot
     */
    async chatbot(message) {
        try {
            console.log('🤖 Sending Chat Message:', message);
            
            const response = await sendChatMessage(message);
            
            console.log('✅ Chat Response Received');
            console.log('   - Response:', response);
            
            return response;
        } catch (error) {
            console.error('❌ Chatbot Error:', error);
            throw error;
        }
    },

    /**
     * FEATURE 4: Diet Plan Generation
     */
    async dietPlan(healthData) {
        try {
            console.log('🍽️  Generating Diet Plan with data:', healthData);
            
            const plan = await generateDietPlan(healthData);
            
            console.log('✅ Diet Plan Generated');
            console.log('   - Title:', plan.title);
            console.log('   - Days:', plan.meals?.length || 0);
            console.log('   - Daily Calories:', plan.daily_calories);
            
            return plan;
        } catch (error) {
            console.error('❌ Diet Plan Error:', error);
            throw error;
        }
    },

    /**
     * FEATURE 5: Health Analytics
     */
    async healthAnalytics(healthData) {
        try {
            console.log('📊 Analyzing Health Data:', healthData);
            
            const analysis = await analyzeHealthData(healthData);
            
            console.log('✅ Health Analysis Complete');
            console.log('   - Health Score:', analysis.healthScore);
            console.log('   - Category:', analysis.scoreCategory);
            console.log('   - Warnings:', analysis.warnings.length);
            console.log('   - Recommendations:', analysis.recommendations.length);
            
            return analysis;
        } catch (error) {
            console.error('❌ Health Analytics Error:', error);
            throw error;
        }
    },

    /**
     * FEATURE 6: Health Report
     */
    async healthReport(healthData) {
        try {
            console.log('📋 Generating Health Report:', healthData);
            
            const report = await generateHealthReport(healthData);
            
            console.log('✅ Health Report Generated');
            console.log('   - Score:', report.overall_score);
            console.log('   - Generated:', report.generated_at);
            
            return report;
        } catch (error) {
            console.error('❌ Health Report Error:', error);
            throw error;
        }
    }
};

// ============================================
// Integration with UI Elements
// ============================================

/**
 * Update Medical Report Upload Handler
 */
async function handleMedicalReportUpload(file) {
    try {
        const result = await FeatureIntegration.medicalReport(file);
        displayReportAnalysis(result.data);
        return result;
    } catch (error) {
        console.error('Upload failed:', error);
        alert('❌ Failed to analyze report: ' + error.message);
    }
}

/**
 * Update Product Scanner Handler
 */
async function handleProductScan(file) {
    try {
        const result = await FeatureIntegration.productScanner(file);
        displayProductAnalysis(result);
        return result;
    } catch (error) {
        console.error('Scan failed:', error);
        alert('❌ Failed to scan product: ' + error.message);
    }
}

/**
 * Update Chatbot Message Handler
 */
async function handleChatMessage(message) {
    try {
        const response = await FeatureIntegration.chatbot(message);
        addChatMessage(response, 'assistant');
        return response;
    } catch (error) {
        console.error('Chat failed:', error);
        addChatMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    }
}

/**
 * Update Diet Plan Generation Handler
 */
async function handleDietPlanGeneration(healthData) {
    try {
        const plan = await FeatureIntegration.dietPlan(healthData);
        displayDietPlan(plan);
        return plan;
    } catch (error) {
        console.error('Diet plan generation failed:', error);
        alert('❌ Failed to generate diet plan: ' + error.message);
    }
}

/**
 * Update Health Analytics Handler
 */
async function handleHealthAnalysis(healthData) {
    try {
        const analysis = await FeatureIntegration.healthAnalytics(healthData);
        displayHealthDashboard(analysis);
        return analysis;
    } catch (error) {
        console.error('Health analysis failed:', error);
        alert('❌ Failed to analyze health: ' + error.message);
    }
}

// ============================================
// API Testing Functions
// ============================================

/**
 * Run comprehensive API tests
 */
async function runAPITests() {
    console.log('🧪 Starting API Tests...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    // Test 1: System Status
    try {
        console.log('Test 1: System Status...');
        const response = await fetch('http://127.0.0.1:5000/api/system/status');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ System Status OK:', data.status);
            results.tests.push({ name: 'System Status', status: 'PASS' });
            results.passed++;
        } else {
            throw new Error('System status check failed');
        }
    } catch (e) {
        console.error('❌ System Status Failed:', e.message);
        results.tests.push({ name: 'System Status', status: 'FAIL', error: e.message });
        results.failed++;
    }
    
    // Test 2: Features List
    try {
        console.log('Test 2: Features List...');
        const response = await fetch('http://127.0.0.1:5000/api/features');
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Features Available: ${data.features.length}`);
            results.tests.push({ name: 'Features List', status: 'PASS' });
            results.passed++;
        } else {
            throw new Error('Features list check failed');
        }
    } catch (e) {
        console.error('❌ Features List Failed:', e.message);
        results.tests.push({ name: 'Features List', status: 'FAIL', error: e.message });
        results.failed++;
    }
    
    // Test 3: Chat API
    try {
        console.log('Test 3: Chat API...');
        const response = await fetch('http://127.0.0.1:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello' })
        });
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Chat API OK');
            results.tests.push({ name: 'Chat API', status: 'PASS' });
            results.passed++;
        } else {
            throw new Error('Chat API failed');
        }
    } catch (e) {
        console.error('❌ Chat API Failed:', e.message);
        results.tests.push({ name: 'Chat API', status: 'FAIL', error: e.message });
        results.failed++;
    }
    
    // Test 4: Diet Plan API
    try {
        console.log('Test 4: Diet Plan API...');
        const response = await fetch('http://127.0.0.1:5000/api/diet-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blood_sugar: 120, BMI: 25 })
        });
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Diet Plan API OK');
            results.tests.push({ name: 'Diet Plan API', status: 'PASS' });
            results.passed++;
        } else {
            throw new Error('Diet Plan API failed');
        }
    } catch (e) {
        console.error('❌ Diet Plan API Failed:', e.message);
        results.tests.push({ name: 'Diet Plan API', status: 'FAIL', error: e.message });
        results.failed++;
    }
    
    // Test 5: Analyze Product API
    try {
        console.log('Test 5: Product Analysis API...');
        const response = await fetch('http://127.0.0.1:5000/api/analyze-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: 'Test Product', 
                calories: 100,
                protein: 5,
                sugar: 2,
                fiber: 3,
                sodium: 150,
                carbs: 15,
                fat: 2
            })
        });
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Product Analysis API OK');
            results.tests.push({ name: 'Product Analysis API', status: 'PASS' });
            results.passed++;
        } else {
            throw new Error('Product Analysis API failed');
        }
    } catch (e) {
        console.error('❌ Product Analysis API Failed:', e.message);
        results.tests.push({ name: 'Product Analysis API', status: 'FAIL', error: e.message });
        results.failed++;
    }
    
    // Test 6: Health Analysis API
    try {
        console.log('Test 6: Health Analysis API...');
        const response = await fetch('http://127.0.0.1:5000/api/analyze-health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                blood_sugar: 120,
                blood_pressure: '130/85',
                cholesterol: 210,
                BMI: 26,
                triglycerides: 180
            })
        });
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Health Analysis API OK');
            results.tests.push({ name: 'Health Analysis API', status: 'PASS' });
            results.passed++;
        } else {
            throw new Error('Health Analysis API failed');
        }
    } catch (e) {
        console.error('❌ Health Analysis API Failed:', e.message);
        results.tests.push({ name: 'Health Analysis API', status: 'FAIL', error: e.message });
        results.failed++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Tests Passed: ${results.passed}`);
    console.log(`❌ Tests Failed: ${results.failed}`);
    console.log('='.repeat(50) + '\n');
    
    return results;
}

// ============================================
// Export for use
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FeatureIntegration,
        runAPITests,
        handleMedicalReportUpload,
        handleProductScan,
        handleChatMessage,
        handleDietPlanGeneration,
        handleHealthAnalysis
    };
}
