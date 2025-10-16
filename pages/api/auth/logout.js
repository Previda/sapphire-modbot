// Logout API - Clear session
export default async function handler(req, res) {
  // Clear auth cookie
  res.setHeader('Set-Cookie', [
    'skyfall_auth=; Path=/; Max-Age=0',
  ]);

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}
