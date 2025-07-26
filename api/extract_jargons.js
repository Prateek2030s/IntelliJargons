module.exports = async function handler(req, res) {
  console.log('Handler called. Method:', req.method);

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.log('No OpenAI API key set');
    return res.status(500).json({ error: 'No OpenAI API key set' });
  }

  const { prompt } = req.body;
  console.log('Prompt received:', prompt);

  if (!prompt || typeof prompt !== 'string') {
    console.log('Missing or invalid prompt');
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  try {
    console.log('Sending request to OpenAI...');
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano-2025-04-14',
        temperature: 0,
        max_tokens: 1500,
        messages: [
          { role: 'system', content: 'Output ONLY valid JSON.' },
          { role: 'user', content: prompt }
        ]
      }),
    });

    console.log('OpenAI response status:', openaiRes.status);

    if (!openaiRes.ok) {
      const info = await openaiRes.json().catch(() => ({}));
      console.log('OpenAI error:', info);
      return res.status(openaiRes.status).json({ error: info.error?.message || 'OpenAI error' });
    }

    const data = await openaiRes.json();
    console.log('OpenAI data:', data);
    const result = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ result });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};