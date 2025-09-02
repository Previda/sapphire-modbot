// Discord webhook utility for error notifications
export async function sendErrorToDiscord(error, context = {}) {
  const webhookUrl = process.env.DISCORD_ERROR_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.error('Discord webhook URL not configured')
    return
  }

  try {
    const embed = {
      title: "🚨 Skyfall Dashboard Error",
      description: `**Error:** ${error.message || error}\n**Context:** ${JSON.stringify(context)}`,
      color: 0xff0000, // Red
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "Stack Trace",
          value: error.stack ? error.stack.substring(0, 1000) : "No stack trace available",
          inline: false
        },
        {
          name: "Environment",
          value: process.env.NODE_ENV || "unknown",
          inline: true
        },
        {
          name: "Timestamp",
          value: new Date().toLocaleString(),
          inline: true
        }
      ],
      footer: {
        text: "Skyfall Dashboard Error Monitor"
      }
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    })
    
    console.log('Error notification sent to Discord')
  } catch (webhookError) {
    console.error('Failed to send error to Discord webhook:', webhookError)
  }
}

// Quick notification for important events
export async function sendNotificationToDiscord(title, message, color = 0x00ff00) {
  const webhookUrl = process.env.DISCORD_ERROR_WEBHOOK_URL
  
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [{
          title,
          description: message,
          color,
          timestamp: new Date().toISOString()
        }]
      })
    })
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}
