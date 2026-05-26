/**
 * Vita Nova AI - Product Scanner API
 * Handle barcode scanning and product OCR analysis
 */

// ============================================
// Product Scanner Functions
// ============================================

/**
 * Scan product label from image file
 * @param {File} file - Product image file
 * @returns {Promise<Object>} Scanned product data and analysis
 */
async function scanProductFromImage(file) {
    try {
        const result = await uploadFileToAPI(
            API_ENDPOINTS.SCAN_PRODUCT,
            file
        );

        if (result.success) {
            return {
                success: true,
                product: result.product,
                analysis: result.analysis,
                extractedText: result.extracted_text
            };
        } else {
            throw new Error(result.error || 'Scan failed');
        }
    } catch (error) {
        console.error('Product Scan Error:', error);
        throw error;
    }
}

/**
 * Analyze product based on nutrition data
 * @param {Object} productData - Product nutrition data
 * @returns {Promise<Object>} Analysis result
 */
async function analyzeProduct(productData) {
    try {
        const result = await apiCall(
            API_ENDPOINTS.ANALYZE_PRODUCT,
            'POST',
            productData
        );

        if (result.success) {
            return {
                success: true,
                product: result.product,
                analysis: result.analysis
            };
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Product Analysis Error:', error);
        throw error;
    }
}

/**
 * Calculate health score percentage for visual display
 * @param {number} score - Health score (0-100)
 * @returns {string} Color based on score
 */
function getScoreColor(score) {
    if (score >= 75) return '#00d084'; // Green
    if (score >= 55) return '#4ade80'; // Light green
    if (score >= 35) return '#facc15'; // Yellow
    if (score >= 15) return '#fb923c'; // Orange
    return '#ef4444'; // Red
}

/**
 * Display product analysis in UI
 * @param {Object} result - Product analysis result
 */
function displayProductAnalysis(result) {
    const productAnalysis = document.getElementById('productAnalysis') || document.getElementById('resultCard');
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
    if (productAnalysis.id === 'resultCard') {
        productAnalysis.style.display = 'block';
    }
}

// Export functions if using module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        scanProductFromImage,
        analyzeProduct,
        displayProductAnalysis
    };
}
