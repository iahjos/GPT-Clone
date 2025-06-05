export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { prompt } = req.body;
  
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
  
    try {
      const openaiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",  // or your production URL
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/mixtral-8x7b-instruct",  // or another supported model
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ]
        })
      });
  
      const data = await openaiRes.json();
      const message = data.choices?.[0]?.message?.content || "No response";
      res.status(200).json({ message });
    } catch (error) {
      console.error("OpenRouter API error:", error);
      res.status(500).json({ error: 'API call failed' });
    }
  }
  