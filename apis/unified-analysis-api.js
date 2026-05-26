/**
 * Vita Nova AI - Unified Document Analyzer API
 * Handle document analyses and markdown rendering
 */

/**
 * Send request to Unified Document Analyzer API
 * @param {Object} data - Profile and analysis params
 * @param {File} file - Optional uploaded file
 * @returns {Promise<Object>} API response
 */
async function analyzeDocument(data, file = null) {
    try {
        let result;
        if (file) {
            // If file is provided, send as multipart form data
            result = await uploadFileToAPI(API_ENDPOINTS.ANALYZE_DOC, file, data);
        } else {
            // Otherwise, send as standard JSON
            result = await apiCall(API_ENDPOINTS.ANALYZE_DOC, 'POST', data);
        }

        if (result && result.success) {
            return result;
        } else {
            throw new Error(result.error || 'Failed to analyze document');
        }
    } catch (error) {
        console.error('Unified Document Analysis API Error:', error);
        throw error;
    }
}

/**
 * Convert markdown text into beautiful HTML
 * @param {string} markdown - Raw markdown from model
 * @returns {string} Styled HTML
 */
function renderMarkdownToHtml(markdown) {
    if (!markdown) return '';

    // Escape basic HTML elements to prevent XSS, but preserve formatting placeholders
    let html = markdown
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Parse Confidence Level block to display it in a custom visual card if needed
    // But we also format it inline.
    
    // 1. Headers
    html = html.replace(/^#\s+(.+)$/gm, '<h3 class="analysis-section-title">$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h4 class="analysis-section-subtitle">$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h5>$1</h5>');

    // 2. Bold text (**bold**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 3. Bullet points (* or -)
    html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
    
    // 4. Line Breaks & Lists grouping
    // Wrap contiguous <li> lines in <ul> blocks
    // Replace sequential groups of <li> tags with <ul>
    html = html.replace(/(<li>.*?<\/li>\s*)+/gs, '<ul>$&</ul>');

    // 5. Paragraph blocks (double newlines)
    html = html.split(/\n{2,}/).map(block => {
        const trimmed = block.strip ? block.strip() : block.trim();
        if (!trimmed) return '';
        
        // Skip wrapping if it's already a structural tag (header, list, list item)
        if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
            return trimmed;
        }
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
}

/**
 * Parse confidence score and reason from the raw response text
 * @param {string} markdown - Raw markdown response
 * @returns {Object} { score: number|null, reason: string }
 */
function extractConfidenceDetails(markdown) {
    if (!markdown) return { score: null, reason: '' };

    const confidenceRegex = /Confidence\s+Level:\s*(\d+)%/i;
    const match = markdown.match(confidenceRegex);
    const score = match ? parseInt(match[1]) : null;

    // Extract Reason section
    let reason = '';
    const reasonIndex = markdown.toLowerCase().indexOf('reason:');
    if (reasonIndex !== -1) {
        reason = markdown.substring(reasonIndex + 7).trim();
        // Remove trailing lines or brackets if any
        reason = renderMarkdownToHtml(reason);
    }

    return { score, reason };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        analyzeDocument,
        renderMarkdownToHtml,
        extractConfidenceDetails
    };
}
