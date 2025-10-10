export default async function handler(req, res) {
  const PI_BOT_API_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3005';
  const PI_BOT_TOKEN = process.env.PI_BOT_TOKEN;
  
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;
      
      const response = await fetch(`${PI_BOT_API_URL}/api/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PI_BOT_TOKEN}`
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      res.status(200).json(result);
      
    } catch (error) {
      res.status(500).json({ error: 'Bot integration failed', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}