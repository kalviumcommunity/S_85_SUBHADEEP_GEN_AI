// DOM element references
const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// --- Event Listeners ---
// Handle sending message on button click
sendButton.addEventListener('click', sendMessage);
// Handle sending message on 'Enter' key press
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

/**
 * Handles the sending of a user's message.
 * It gets the user's input, displays it, and triggers the bot's AI response.
 */
async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    // Display user's message in the chat log
    appendMessage('user', userMessage);
    userInput.value = ''; // Clear the input field

    // Show typing indicator and get bot response from the AI
    showTypingIndicator();
    try {
        const botMessage = await getAIResponse(userMessage);
        hideTypingIndicator();
        appendMessage('bot', botMessage);
    } catch (error) {
        hideTypingIndicator();
        appendMessage('bot', 'Sorry, something went wrong. Please try again.');
        console.error('Error fetching AI response:', error);
    }
}

/**
 * Appends a message to the chat log.
 * @param {string} sender - Who sent the message ('user' or 'bot').
 * @param {string} message - The content of the message.
 */
function appendMessage(sender, message) {
    const messageWrapper = document.createElement('div');
    const messageElement = document.createElement('div');

    // Set common styles for the message bubble
    messageElement.classList.add('p-3', 'rounded-lg', 'max-w-xs', 'chat-bubble');

    if (sender === 'user') {
        // Style for user messages
        messageWrapper.classList.add('flex', 'justify-end', 'mb-4');
        messageElement.classList.add('bg-blue-600', 'text-white');
    } else {
        // Style for bot messages
        messageWrapper.classList.add('flex', 'justify-start', 'mb-4');
        messageElement.classList.add('bg-gray-200', 'text-gray-800');
    }

    messageElement.innerHTML = `<p>${message}</p>`;
    messageWrapper.appendChild(messageElement);
    chatLog.appendChild(messageWrapper);

    // Automatically scroll to the latest message
    chatLog.scrollTop = chatLog.scrollHeight;
}

/**
 * Fetches a response from our server, which now calls the Groq API.
 * @param {string} prompt - The message from the user.
 * @returns {Promise<string>} The bot's AI-generated response.
 */
async function getAIResponse(prompt) {
    // The URL now points to YOUR local server's endpoint
    const serverUrl = 'http://localhost:3000/api/chat';

    const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: prompt }) // Send the message in the body
    });

    if (!response.ok) {
        throw new Error(`Server request failed with status ${response.status}`);
    }

    const result = await response.json();
    
    // **FIXED CODE**: This part is now updated for Groq's OpenAI-compatible response structure
    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
        const rawText = result.choices[0].message.content;
        // Sanitize the response to prevent potential HTML injection
        return rawText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    } else {
        // Handle cases where the AI response might be empty or malformed
        console.error("Unexpected API response format:", result);
        return "I'm sorry, I received an unexpected response from the server.";
    }
}


/**
 * Shows a typing indicator in the chat log.
 */
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.classList.add('flex', 'justify-start', 'mb-4');
    typingIndicator.innerHTML = `
        <div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs">
            <div class="flex items-center space-x-1">
                <span class="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style="animation-delay: 0s;"></span>
                <span class="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style="animation-delay: 0.2s;"></span>
                <span class="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style="animation-delay: 0.4s;"></span>
            </div>
        </div>
    `;
    chatLog.appendChild(typingIndicator);
    chatLog.scrollTop = chatLog.scrollHeight;
}

/**
 * Hides the typing indicator from the chat log.
 */
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}
