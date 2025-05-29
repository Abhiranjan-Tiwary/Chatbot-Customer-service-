const googleGeminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDqmDVvrT58uxcA2Uitv5DTx7siTclCqik'; // Corrected API URL
const googleGeminiApiKey = 'AIzaSyDqmDVvrT58uxcA2Uitv5DTx7siTclCqik'; // Google Gemini API key

const initialPrompt = "You are customer support bot, an assistant for customer support. You must only address queries related to Customer support service and some general talks about the user, transactions, and financial advice. Do not engage in topics outside customer support such as the solar system or unrelated subjects."; // Fixed 'genral'
let conversationHistory = [
    { role: 'system', content: initialPrompt }
];
let chase = [...conversationHistory];

async function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (!userInput) return;
    displayMessage('User', userInput);
    document.getElementById('user-input').value = '';
    
    // Special handling if user asks for the bot's name.
    if (userInput.trim().toLowerCase() === "what is your name") {
        const nameResponse = "GitHub Copilot";
        conversationHistory.push({ role: 'user', content: userInput });
        conversationHistory.push({ role: 'assistant', content: nameResponse });
        chase.push({ role: 'user', content: userInput });
        chase.push({ role: 'assistant', content: nameResponse });
        displayMessage('Assistant', nameResponse);
        return;
    }
    
    conversationHistory.push({ role: 'user', content: userInput });
    chase.push({ role: 'user', content: userInput });
    
    const botResponse = await callApiForResponse();
    displayMessage('Assistant', botResponse);
    conversationHistory.push({ role: 'assistant', content: botResponse });
    chase.push({ role: 'assistant', content: botResponse });
}

async function callApiForResponse() {
    const prompt = conversationHistory.map(m => {
        if (m.role === 'system') return m.content;
        return m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`;
    }).join("\n") + "\nAssistant:";
    console.log("Sending prompt:", prompt);
    try {
        const response = await fetch(googleGeminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response from API:", errorText);
            throw new Error("API error");
        }
        const data = await response.json();
        console.log("Received data:", data);
        // Extract text from data.candidates[0].content.parts[0].text.
        const result = data.candidates && data.candidates[0] &&
            data.candidates[0].content && data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0].text
            ? data.candidates[0].content.parts[0].text.trim()
            : "I'm sorry, I received an empty response.";
        return result;
    } catch (error) {
        console.error("API call error details:", error);
        return "I'm sorry, I'm currently unable to process your request due to technical issues.";
    }
}

function displayMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender.toLowerCase());
    messageDiv.innerHTML = `<span class="font-semibold">${sender}:</span> ${message}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function setupChatbot() {
    console.log('Chatbot is ready.');
}

document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
setupChatbot();
