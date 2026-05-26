/**
 * Vita Nova AI - Chatbot API
 * 24/7 AI-powered nutrition assistant
 */

// ============================================
// Chatbot Functions
// ============================================

/**
 * Send message to AI chatbot and get response
 * @param {string} message - User message
 * @returns {Promise<string>} AI response
 */
async function sendChatMessage(message) {
    try {
        if (!message.trim()) {
            throw new Error('Message cannot be empty');
        }

        const result = await apiCall(
            API_ENDPOINTS.CHAT,
            'POST',
            { message: message.trim() }
        );

        if (result.success) {
            return result.ai_response;
        } else {
            throw new Error(result.error || 'Chat failed');
        }
    } catch (error) {
        console.error('Chat Error:', error);
        throw error;
    }
}

/**
 * Get suggested questions for chatbot
 * @returns {Promise<Array>} List of suggestions
 */
async function getChatSuggestions() {
    try {
        const result = await apiCall(
            API_ENDPOINTS.CHAT_SUGGESTIONS,
            'GET'
        );
        return result.suggestions || [];
    } catch (error) {
        console.error('Failed to get chat suggestions:', error);
        // Return default suggestions
        return [
            "What makes a balanced diet?",
            "How can I manage diabetes with diet?",
            "What foods are good for weight loss?",
            "How much water should I drink daily?"
        ];
    }
}

/**
 * Format chatbot message for display
 * @param {Object} message - Message object
 * @param {string} sender - 'user' or 'assistant'
 * @returns {string} Formatted HTML
 */
function formatChatMessage(message, sender = 'user') {
    const content = typeof message === 'string' ? message : message.text || '';
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });

    return `
        <div class="chat-message ${sender}">
            <div class="message-content">
                <p>${escapeHtml(content)}</p>
                <span class="message-time">${timestamp}</span>
            </div>
        </div>
    `;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Display chat interface
 * @param {Array} messages - Array of messages
 */
function displayChatMessages(messages) {
    const chatContainer = document.getElementById('chatMessages') || 
                         document.getElementById('chatContainer');
    
    if (!chatContainer) return;

    let htmlContent = '<div class="chat-messages">';
    
    messages.forEach(msg => {
        htmlContent += formatChatMessage(msg.content || msg, msg.sender || 'assistant');
    });
    
    htmlContent += '</div>';
    chatContainer.innerHTML = htmlContent;
    
    // Scroll to bottom
    setTimeout(() => {
        const messagesDiv = chatContainer.querySelector('.chat-messages');
        if (messagesDiv) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }, 100);
}

/**
 * Add message to chat display
 * @param {string} text - Message text
 * @param {string} sender - 'user' or 'assistant'
 */
function addChatMessage(text, sender = 'user') {
    const chatContainer = document.getElementById('chatMessages') || 
                         document.getElementById('chatContainer');
    
    if (!chatContainer) return;

    const messagesDiv = chatContainer.querySelector('.chat-messages') || 
                       (function() {
                           const div = document.createElement('div');
                           div.className = 'chat-messages';
                           chatContainer.appendChild(div);
                           return div;
                       })();

    messagesDiv.innerHTML += formatChatMessage(text, sender);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/**
 * Create typing indicator
 * @returns {string} HTML for typing indicator
 */
function createTypingIndicator() {
    return `
        <div class="chat-message assistant typing">
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
}

// Export functions if using module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendChatMessage,
        getChatSuggestions,
        formatChatMessage,
        displayChatMessages,
        addChatMessage,
        escapeHtml,
        createTypingIndicator
    };
}
