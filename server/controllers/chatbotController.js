const axios = require('axios');

exports.askChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const systemPrompt = `You are an AI assistant for a healthcare application called MediCare. 
You must ONLY answer questions related to healthcare, medicine, doctors, diseases, and wellness. 
If the user asks something unrelated to healthcare, politely decline to answer and remind them that you are a healthcare assistant.
Be concise, professional, and empathetic. Do NOT provide definitive medical diagnoses, instead recommend consulting a doctor.`;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 512
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        
        res.json({ success: true, reply });
    } catch (error) {
        console.error('Chatbot error:', error?.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
};
