    /**
 * Vita Nova AI - Medical Report API
 * Handle medical report uploads and analysis
 */

// ============================================
// Medical Report Functions
// ============================================

/**
 * Upload and analyze medical report
 * @param {File} file - Medical report file
 * @returns {Promise<Object>} Analysis result
 */
async function uploadMedicalReport(file) {
    try {
        const result = await uploadFileToAPI(
            API_ENDPOINTS.UPLOAD_REPORT,
            file
        );

        if (result.success) {
            return {
                success: true,
                data: {
                    filename: result.filename,
                    healthData: result.health_data,
                    assessment: result.assessment,
                    dietPlan: result.diet_plan
                }
            };
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Medical Report Upload Error:', error);
        throw error;
    }
}

/**
 * Get default health data template
 * @returns {Promise<Object>} Default health data
 */
async function getHealthDataTemplate() {
    try {
        const result = await apiCall(
            API_ENDPOINTS.HEALTH_DATA,
            'GET'
        );
        return result.health_data || {};
    } catch (error) {
        console.error('Failed to get health data template:', error);
        return {};
    }
}

/**
 * Display medical report analysis in UI
 * @param {Object} analysisData - Analysis data from backend
 */
function displayReportAnalysis(analysisData) {
    const resultCard = document.getElementById('resultCard');
    if (!resultCard) return;

    const healthData = analysisData.healthData || analysisData.health_data;
    const assessment = analysisData.assessment || {};

    let htmlContent = `
        <div class="analysis-result">
            <h3>📊 Health Analysis Report</h3>
            
            <div class="health-metrics">
                <h4>Your Health Metrics:</h4>
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-label">Blood Sugar:</span>
                        <span class="metric-value">${healthData.blood_sugar || 'N/A'} mg/dL</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Blood Pressure:</span>
                        <span class="metric-value">${healthData.blood_pressure || 'N/A'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Cholesterol:</span>
                        <span class="metric-value">${healthData.cholesterol || 'N/A'} mg/dL</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">BMI:</span>
                        <span class="metric-value">${healthData.BMI || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="assessment-section">
                <h4>Overall Assessment: ${assessment.overall_health || 'Moderate'}</h4>
                
                ${assessment.risk_areas && assessment.risk_areas.length > 0 ? `
                    <div class="risk-areas">
                        <h5>⚠️ Areas of Concern:</h5>
                        <ul>
                            ${assessment.risk_areas.map(risk => `<li>${risk}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${assessment.recommendations && assessment.recommendations.length > 0 ? `
                    <div class="recommendations">
                        <h5>✅ Recommendations:</h5>
                        <ul>
                            ${assessment.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    resultCard.innerHTML = htmlContent;
    resultCard.style.display = 'block';
}

// Export functions if using module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        uploadMedicalReport,
        getHealthDataTemplate,
        displayReportAnalysis
    };
}
