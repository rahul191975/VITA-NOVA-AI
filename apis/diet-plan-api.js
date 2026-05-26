/**
 * Vita Nova AI - Diet Plan API
 * Generate and manage personalized diet plans
 */

// ============================================
// Diet Plan Functions
// ============================================

/**
 * Generate personalized diet plan based on health data
 * @param {Object} healthData - User health metrics
 * @returns {Promise<Object>} Generated diet plan
 */
async function generateDietPlan(healthData) {
    try {
        const result = await apiCall(
            API_ENDPOINTS.DIET_PLAN,
            'POST',
            healthData
        );

        if (result.success) {
            return result.plan;
        } else {
            throw new Error(result.error || 'Diet plan generation failed');
        }
    } catch (error) {
        console.error('Diet Plan Generation Error:', error);
        throw error;
    }
}

/**
 * Get diet plan template
 * @returns {Promise<Object>} Template structure
 */
async function getDietPlanTemplate() {
    try {
        const result = await apiCall(
            API_ENDPOINTS.DIET_PLAN_TEMPLATE,
            'GET'
        );
        return result.template;
    } catch (error) {
        console.error('Failed to get diet plan template:', error);
        return {};
    }
}

/**
 * Display diet plan in UI
 * @param {Object} dietPlan - Diet plan data
 */
function displayDietPlan(dietPlan) {
    const dietSection = document.getElementById('diet') || 
                       document.getElementById('dietPlan');
    
    if (!dietSection) return;

    const meals = dietPlan.meals || [];
    const macros = dietPlan.macros || {};
    const tips = dietPlan.tips || [];

    let htmlContent = `
        <div class="diet-plan-display">
            <h3>🍽️ Your ${dietPlan.title || 'Personalized Diet Plan'}</h3>
            
            <div class="plan-summary">
                <div class="summary-card">
                    <span class="summary-label">Duration:</span>
                    <span class="summary-value">${dietPlan.duration || '5 days'}</span>
                </div>
                <div class="summary-card">
                    <span class="summary-label">Daily Calories:</span>
                    <span class="summary-value">${dietPlan.daily_calories || 2000} kcal</span>
                </div>
            </div>

            <div class="macronutrients">
                <h4>Macro Distribution:</h4>
                <div class="macro-bars">
                    <div class="macro-item">
                        <span class="macro-label">Protein</span>
                        <div class="macro-bar">
                            <div class="macro-fill protein" style="width: ${parseInt(macros.protein) || 30}%"></div>
                        </div>
                        <span class="macro-value">${macros.protein || '30%'}</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-label">Carbs</span>
                        <div class="macro-bar">
                            <div class="macro-fill carbs" style="width: ${parseInt(macros.carbs) || 40}%"></div>
                        </div>
                        <span class="macro-value">${macros.carbs || '40%'}</span>
                    </div>
                    <div class="macro-item">
                        <span class="macro-label">Fats</span>
                        <div class="macro-bar">
                            <div class="macro-fill fats" style="width: ${parseInt(macros.fats) || 30}%"></div>
                        </div>
                        <span class="macro-value">${macros.fats || '30%'}</span>
                    </div>
                </div>
            </div>

            <div class="meal-plan">
                <h4>📅 Weekly Meal Plan:</h4>
                <div class="meals-grid">
                    ${meals.map((meal, index) => `
                        <div class="meal-day" data-day="${meal.day || 'Day ' + (index + 1)}">
                            <h5>${meal.day || 'Day ' + (index + 1)}</h5>
                            <div class="meals-list">
                                <div class="meal-item">
                                    <span class="meal-type">🌅 Breakfast:</span>
                                    <span class="meal-name">${meal.breakfast || 'N/A'}</span>
                                </div>
                                <div class="meal-item">
                                    <span class="meal-type">☀️ Lunch:</span>
                                    <span class="meal-name">${meal.lunch || 'N/A'}</span>
                                </div>
                                <div class="meal-item">
                                    <span class="meal-type">🌙 Dinner:</span>
                                    <span class="meal-name">${meal.dinner || 'N/A'}</span>
                                </div>
                                <div class="meal-item">
                                    <span class="meal-type">🍎 Snacks:</span>
                                    <span class="meal-name">${meal.snacks || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            ${tips && tips.length > 0 ? `
                <div class="health-tips">
                    <h4>💡 Health Tips:</h4>
                    <ul>
                        ${tips.map(tip => `<li>✓ ${tip}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;

    if (dietSection.innerHTML) {
        dietSection.innerHTML = htmlContent;
    } else {
        dietSection.appendChild(document.createRange().createContextualFragment(htmlContent));
    }
    
    // Scroll to diet section
    if (dietSection.scrollIntoView) {
        dietSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Export diet plan as text
 * @param {Object} dietPlan - Diet plan data
 * @returns {string} Formatted diet plan text
 */
function exportDietPlanAsText(dietPlan) {
    let text = `VITA NOVA AI - DIET PLAN\n`;
    text += `${'='.repeat(50)}\n\n`;
    text += `Title: ${dietPlan.title || 'Personalized Diet Plan'}\n`;
    text += `Duration: ${dietPlan.duration || '5 days'}\n`;
    text += `Daily Calories: ${dietPlan.daily_calories || 2000} kcal\n\n`;
    
    text += `MACRO DISTRIBUTION\n${'-'.repeat(30)}\n`;
    text += `Protein: ${dietPlan.macros?.protein || '30%'}\n`;
    text += `Carbs: ${dietPlan.macros?.carbs || '40%'}\n`;
    text += `Fats: ${dietPlan.macros?.fats || '30%'}\n\n`;
    
    text += `MEAL PLAN\n${'-'.repeat(30)}\n`;
    (dietPlan.meals || []).forEach((meal, index) => {
        text += `\n${meal.day || 'Day ' + (index + 1)}\n`;
        text += `  Breakfast: ${meal.breakfast}\n`;
        text += `  Lunch: ${meal.lunch}\n`;
        text += `  Dinner: ${meal.dinner}\n`;
        text += `  Snacks: ${meal.snacks}\n`;
    });
    
    if (dietPlan.tips && dietPlan.tips.length > 0) {
        text += `\nHEALTH TIPS\n${'-'.repeat(30)}\n`;
        dietPlan.tips.forEach(tip => {
            text += `• ${tip}\n`;
        });
    }
    
    return text;
}

/**
 * Download diet plan as text file
 * @param {Object} dietPlan - Diet plan data
 */
function downloadDietPlan(dietPlan) {
    const text = exportDietPlanAsText(dietPlan);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diet-plan-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Export functions if using module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateDietPlan,
        getDietPlanTemplate,
        displayDietPlan,
        exportDietPlanAsText,
        downloadDietPlan
    };
}
