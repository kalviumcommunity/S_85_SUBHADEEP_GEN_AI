// Import necessary packages
const express = require('express');
const fetch = require('node-fetch'); // Using node-fetch@2 for compatibility
const cors = require('cors'); // To allow requests from the frontend
require('dotenv').config(); // To load environment variables from .env file

// Initialize the Express app
const app = express();
const PORT = 3000; // The port the server will run on

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- API Route for Groq ---
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    // Securely get the Groq API key from the environment variables
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
        return res.status(500).json({ error: 'Groq API key is not configured on the server.' });
    }

    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    // Groq uses an OpenAI-compatible payload structure
    const payload = {
        messages: [{
            role: "user",
            content: message
        }],
        model: "llama3-8b-8192" // Or another model you prefer, like "mixtral-8x7b-32768"
    };

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`, // Groq uses a Bearer token
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('Groq API Error:', errorText);
            throw new Error(`API request failed with status ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        res.json(data);

    } catch (error) {
        console.error('Error in /api/chat route:', error);
        res.status(500).json({ error: 'Failed to fetch response from Groq model.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
