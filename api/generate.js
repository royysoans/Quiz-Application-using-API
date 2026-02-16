export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ message: 'Server configuration error: Missing API Key' });
  }

  const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  try {
    const groqResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: request.body.messages,
        response_format: { type: "json_object" } // Force JSON mode
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error('Groq API Error:', errorData);
      throw new Error(errorData.error?.message || 'Groq API request failed');
    }

    const data = await groqResponse.json();
    response.status(200).json(data);

  } catch (error) {
    console.error('Error proxying to Groq API:', error);
    response.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}