/**
 * Vita Nova AI - Health Analytics API
 * Track and analyze health metrics
 */

// ============================================
// Health Analytics Functions
// ============================================

/**
 * Analyze health data and get insights
 * @param {Object} healthData - Health metrics
 * @returns {Promise<Object>} Analysis result with recommendations
 */
async function analyzeHealthData(healthData) {
    try {
        const result = await apiCall(
            API_ENDPOINTS.ANALYZE_HEALTH,
            'POST',
            healthData
        );

        if (result.success) {
            return {
                success: true,
                healthScore: result.health_score,
                scoreCategory: result.score_category,
                warnings: result.warnings || [],
                recommendations: result.recommendations || []
            };
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Health Analysis Error:', error);
        throw error;
    }
}

/**
 * Get comprehensive health report
 * @param {Object} healthData - Health metrics
 * @returns {Promise<Object>} Detailed health report
 */
async function generateHealthReport(healthData) {
    try {
        const result = await apiCall(
            API_ENDPOINTS.HEALTH_REPORT,
            'POST',
            healthData
        );

        if (result.success) {
            return result.report;
        } else {
            throw new Error(result.error || 'Report generation failed');
        }
    } catch (error) {
        console.error('Health Report Error:', error);
        throw error;
    }
}

/**
 * Get interpretation for a specific metric
 * @param {string} metricName - Metric name (e.g., 'blood_sugar')
 * @returns {Promise<Object>} Metric interpretation
 */
async function getMetricInterpretation(metricName) {
    try {
        const result = await apiCall(
            `${API_ENDPOINTS.METRICS_INTERPRETATION}/${metricName}`,
            'GET'
        );

        if (result.success) {
            return result.interpretation;
        } else {
            throw new Error(result.error || 'Failed to get interpretation');
        }
    } catch (error) {
        console.error(`Metric Interpretation Error (${metricName}):`, error);
        return {};
    }
}

/**
 * Calculate risk level based on health score
 * @param {number} score - Health score (0-100)
 * @returns {Object} Risk information
 */
function calculateRiskLevel(score) {
    if (score >= 80) {
        return {
            level: 'Excellent',
            color: '#00d084',
            icon: '✨',
            description: 'Your health metrics are excellent!'
        };
    } else if (score >= 60) {
        return {
            level: 'Good',
            color: '#4ade80',
            icon: '👍',
            description: 'Your health is in good condition.'
        };
    } else if (score >= 40) {
        return {
            level: 'Moderate',
            color: '#facc15',
            icon: '⚠️',
            description: 'Some health concerns need attention.'
        };
    } else {
        return {
            level: 'Poor',
            color: '#ef4444',
            icon: '🚨',
            description: 'Please consult a healthcare provider.'
        };
    }
}

/**
 * Display health analytics dashboard
 * @param {Object} analysis - Analysis data
 */
function displayHealthDashboard(analysis) {
    const dashboardContainer = document.getElementById('healthDashboard') || 
                              document.getElementById('analyticsContainer');
    
    if (!dashboardContainer) return;

    const riskInfo = calculateRiskLevel(analysis.healthScore || 50);

    let htmlContent = `
        <div class="health-dashboard">
            <h3>📈 Health Analytics Dashboard</h3>
            
            <div class="health-score-card" style="border-color: ${riskInfo.color}">
                <div class="score-header">
                    <span class="score-icon">${riskInfo.icon}</span>
                    <h4>Overall Health Score</h4>
                </div>
                <div class="score-display">
                    <div class="score-number" style="color: ${riskInfo.color}">
                        ${analysis.healthScore || 0}
                    </div>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${analysis.healthScore || 0}%; background-color: ${riskInfo.color}"></div>
                    </div>
                    <p class="score-level" style="color: ${riskInfo.color}">
                        ${riskInfo.level} - ${riskInfo.description}
                    </p>
                </div>
            </div>

            ${analysis.warnings && analysis.warnings.length > 0 ? `
                <div class="warnings-section">
                    <h4>⚠️ Health Warnings</h4>
                    <div class="warnings-list">
                        ${analysis.warnings.map(warning => `
                            <div class="warning-item">
                                <span class="warning-icon">⚠️</span>
                                <span class="warning-text">${warning}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${analysis.recommendations && analysis.recommendations.length > 0 ? `
                <div class="recommendations-section">
                    <h4>💡 Recommendations</h4>
                    <div class="recommendations-list">
                        ${analysis.recommendations.map(rec => `
                            <div class="recommendation-item">
                                <span class="rec-icon">✓</span>
                                <span class="rec-text">${rec}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    dashboardContainer.innerHTML = htmlContent;
    dashboardContainer.style.display = 'block';
}

/**
 * Display health metrics table
 * @param {Object} healthData - Health metrics
 */
function displayHealthMetrics(healthData) {
    const metricsContainer = document.getElementById('healthMetrics') || 
                            document.getElementById('metricsContainer');
    
    if (!metricsContainer) return;

    const metrics = [
        { name: 'Blood Sugar', value: healthData.blood_sugar, unit: 'mg/dL', icon: '🩸' },
        { name: 'Blood Pressure', value: healthData.blood_pressure, unit: '', icon: '❤️' },
        { name: 'Cholesterol', value: healthData.cholesterol, unit: 'mg/dL', icon: '⚕️' },
        { name: 'BMI', value: healthData.BMI, unit: '', icon: '⚖️' },
        { name: 'Triglycerides', value: healthData.triglycerides, unit: 'mg/dL', icon: '📊' }
    ];

    let htmlContent = `<div class="metrics-table">`;
    
    metrics.forEach(metric => {
        if (metric.value) {
            htmlContent += `
                <div class="metric-row">
                    <span class="metric-icon">${metric.icon}</span>
                    <span class="metric-name">${metric.name}</span>
                    <span class="metric-value">${metric.value} ${metric.unit}</span>
                </div>
            `;
        }
    });
    
    htmlContent += `</div>`;
    metricsContainer.innerHTML = htmlContent;
}

/**
 * Export health report as text
 * @param {Object} report - Health report
 * @returns {string} Formatted report text
 */
function exportHealthReportAsText(report) {
    let text = `VITA NOVA AI - HEALTH REPORT\n`;
    text += `${'='.repeat(50)}\n`;
    text += `Generated: ${report.generated_at || new Date().toISOString()}\n\n`;
    
    text += `HEALTH SCORE\n${'-'.repeat(30)}\n`;
    text += `Overall Score: ${report.overall_score}/100\n\n`;
    
    text += `HEALTH METRICS\n${'-'.repeat(30)}\n`;
    Object.entries(report.metrics || {}).forEach(([key, value]) => {
        text += `${key}: ${value}\n`;
    });
    
    if (report.warnings && report.warnings.length > 0) {
        text += `\nWARNINGS\n${'-'.repeat(30)}\n`;
        report.warnings.forEach(warning => {
            text += `⚠️  ${warning}\n`;
        });
    }
    
    if (report.recommendations && report.recommendations.length > 0) {
        text += `\nRECOMMENDATIONS\n${'-'.repeat(30)}\n`;
        report.recommendations.forEach(rec => {
            text += `✓ ${rec}\n`;
        });
    }
    
    text += `\nNext Checkup: ${report.next_checkup || 'In 3 months'}\n`;
    
    return text;
}

// Export functions if using module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        analyzeHealthData,
        generateHealthReport,
        getMetricInterpretation,
        calculateRiskLevel,
        displayHealthDashboard,
        displayHealthMetrics,
        exportHealthReportAsText
    };
}
