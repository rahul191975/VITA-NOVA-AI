/**
 * Vita Nova AI - API Configuration
 * Centralized configuration for all API calls
 */

// ============================================
// API Configuration
// ============================================

const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:5000/api',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 2,
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// API Endpoints by Feature
const API_ENDPOINTS = {
    // Medical Report Endpoints
    UPLOAD_REPORT: '/upload-report',
    HEALTH_DATA: '/health-data',
    
    // Product Scanner Endpoints
    SCAN_PRODUCT: '/scan-product',
    ANALYZE_PRODUCT: '/analyze-product',
    
    // Chatbot Endpoints
    CHAT: '/chat',
    CHAT_SUGGESTIONS: '/chat/suggestions',
    
    // Diet Plan Endpoints
    DIET_PLAN: '/diet-plan',
    DIET_PLAN_TEMPLATE: '/diet-plan-template',
    
    // Health Analytics Endpoints
    HEALTH_CHECK: '/health',
    ANALYZE_HEALTH: '/analyze-health',
    METRICS_INTERPRETATION: '/metrics-interpretation',
    HEALTH_REPORT: '/health-report',
    
    // System Endpoints
    SYSTEM_STATUS: '/system/status',
    FEATURES: '/features',
    
    // Unified Analysis Endpoint
    ANALYZE_DOC: '/analyze-doc'
};

// ============================================
// Generic API Helper Functions
// ============================================

/**
 * Make a generic API call with error handling and retry logic
 */
async function apiCall(endpoint, method = 'GET', data = null, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const finalOptions = {
        method: method,
        headers: { ...API_CONFIG.HEADERS, ...options.headers }
    };

    if (data && method !== 'GET') {
        finalOptions.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Upload file to backend with FormData
 */
async function uploadFileToAPI(endpoint, file, additionalData = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const formData = new FormData();

    formData.append('file', file);

    // Add any additional fields
    for (const [key, value] of Object.entries(additionalData)) {
        formData.append(key, value);
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
            // Note: Don't set Content-Type header - browser will set it with boundary
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`File Upload Error [${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Check if API is available
 */
async function checkAPIHealth() {
    try {
        const response = await apiCall(API_ENDPOINTS.SYSTEM_STATUS);
        return response.status === 'operational';
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}

/**
 * Get list of available features
 */
async function getAvailableFeatures() {
    try {
        const response = await apiCall(API_ENDPOINTS.FEATURES);
        return response.features || [];
    } catch (error) {
        console.error('Failed to get features:', error);
        return [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        API_ENDPOINTS,
        apiCall,
        uploadFileToAPI,
        checkAPIHealth,
        getAvailableFeatures
    };
}
