// Simple debug endpoint to test if the /api/bot/live/ directory works
export default function handler(req, res) {
  res.status(200).json({
    message: 'Debug endpoint working',
    path: '/api/bot/live/debug',
    timestamp: new Date().toISOString()
  });
}
