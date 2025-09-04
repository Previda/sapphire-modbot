export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { error, stack, interaction } = req.body;
    
    // Log error to console
    console.error('Bot Error Report:', {
      error,
      interaction,
      timestamp: new Date().toISOString()
    });

    // Store error in memory for dashboard display
    if (!global.botErrors) {
      global.botErrors = [];
    }
    
    global.botErrors.unshift({
      id: Date.now(),
      error,
      stack,
      interaction,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 errors
    if (global.botErrors.length > 50) {
      global.botErrors = global.botErrors.slice(0, 50);
    }

    // Send error to Discord webhook if configured
    const webhookUrl = process.env.DISCORD_ERROR_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: '🚨 Bot Error Report',
              color: 0xff0000,
              fields: [
                { name: 'Error', value: error.substring(0, 1024), inline: false },
                { name: 'Command', value: interaction?.commandName || 'N/A', inline: true },
                { name: 'User', value: interaction?.user || 'N/A', inline: true },
                { name: 'Guild', value: interaction?.guild || 'N/A', inline: true }
              ],
              timestamp: new Date().toISOString()
            }]
          })
        });
      } catch (webhookError) {
        console.error('Failed to send error to Discord webhook:', webhookError);
      }
    }

    res.status(200).json({ success: true, message: 'Error logged successfully' });
  } catch (err) {
    console.error('Error handling bot error report:', err);
    res.status(500).json({ error: 'Failed to log error' });
  }
}
