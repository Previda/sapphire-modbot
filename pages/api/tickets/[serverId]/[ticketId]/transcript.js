export default async function handler(req, res) {
  const { serverId, ticketId } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!serverId || !ticketId) {
    return res.status(400).json({ error: 'Server ID and ticket ID required' });
  }

  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    // Fetch channel information
    const channelResponse = await fetch(`https://discord.com/api/v10/channels/${ticketId}`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!channelResponse.ok) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channelData = await channelResponse.json();

    // Fetch messages from the channel
    let allMessages = [];
    let lastMessageId = null;
    
    // Fetch messages in batches (Discord API limit is 100 per request)
    while (true) {
      const messagesUrl = `https://discord.com/api/v10/channels/${ticketId}/messages?limit=100` + 
                         (lastMessageId ? `&before=${lastMessageId}` : '');
      
      const messagesResponse = await fetch(messagesUrl, {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!messagesResponse.ok) {
        break;
      }

      const messages = await messagesResponse.json();
      
      if (messages.length === 0) {
        break;
      }

      allMessages = [...allMessages, ...messages];
      lastMessageId = messages[messages.length - 1].id;
      
      // Prevent infinite loops and rate limiting
      if (allMessages.length > 1000 || messages.length < 100) {
        break;
      }
    }

    // Sort messages chronologically (oldest first)
    allMessages.reverse();

    // Format transcript
    const transcript = {
      channel: {
        id: channelData.id,
        name: channelData.name,
        topic: channelData.topic,
        createdAt: new Date(((BigInt(channelData.id) >> 22n) + 1420070400000n)).toISOString()
      },
      server: {
        id: serverId
      },
      messages: allMessages.map(message => ({
        id: message.id,
        timestamp: message.timestamp,
        author: {
          id: message.author.id,
          username: message.author.username,
          discriminator: message.author.discriminator || '0',
          avatar: message.author.avatar,
          displayName: message.author.global_name || message.author.username,
          bot: message.author.bot || false
        },
        content: message.content,
        embeds: message.embeds || [],
        attachments: message.attachments?.map(att => ({
          id: att.id,
          filename: att.filename,
          size: att.size,
          url: att.url,
          contentType: att.content_type
        })) || [],
        reactions: message.reactions || [],
        editedAt: message.edited_timestamp,
        type: message.type || 0,
        flags: message.flags || 0
      })),
      stats: {
        totalMessages: allMessages.length,
        participants: [...new Set(allMessages.map(m => m.author.id))].length,
        timespan: allMessages.length > 0 ? {
          start: allMessages[0].timestamp,
          end: allMessages[allMessages.length - 1].timestamp
        } : null
      },
      generatedAt: new Date().toISOString()
    };

    // Generate HTML transcript for display
    const htmlTranscript = generateHTMLTranscript(transcript);

    return res.status(200).json({
      success: true,
      transcript,
      html: htmlTranscript,
      downloadUrl: `/api/tickets/${serverId}/${ticketId}/transcript/download`
    });

  } catch (error) {
    console.error('Transcript generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate transcript',
      details: error.message
    });
  }
}

function generateHTMLTranscript(transcript) {
  const { channel, messages, stats, generatedAt } = transcript;
  
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatMessage = (message) => {
    const avatar = message.author.avatar 
      ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=32`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(message.author.discriminator) % 5}.png`;

    let content = message.content || '';
    
    // Format basic Discord markdown
    content = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/\n/g, '<br>');

    const attachments = message.attachments?.map(att => 
      `<div class="attachment">📎 <a href="${att.url}" target="_blank">${att.filename}</a> (${(att.size / 1024).toFixed(1)} KB)</div>`
    ).join('') || '';

    const embeds = message.embeds?.map(embed => 
      `<div class="embed">
        ${embed.title ? `<div class="embed-title">${embed.title}</div>` : ''}
        ${embed.description ? `<div class="embed-description">${embed.description}</div>` : ''}
      </div>`
    ).join('') || '';

    return `
      <div class="message" data-message-id="${message.id}">
        <img class="avatar" src="${avatar}" alt="${message.author.username}" />
        <div class="message-content">
          <div class="message-header">
            <span class="username" style="color: ${message.author.bot ? '#7289da' : '#ffffff'}">${message.author.displayName}</span>
            ${message.author.bot ? '<span class="bot-tag">BOT</span>' : ''}
            <span class="timestamp">${formatTimestamp(message.timestamp)}</span>
          </div>
          <div class="message-body">
            ${content}
            ${attachments}
            ${embeds}
          </div>
        </div>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transcript - ${channel.name}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: #36393f; 
          color: #dcddde; 
          margin: 0; 
          padding: 20px; 
        }
        .header { 
          background: #2f3136; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 20px; 
        }
        .channel-name { 
          font-size: 24px; 
          font-weight: bold; 
          color: #ffffff; 
        }
        .stats { 
          margin-top: 10px; 
          color: #b9bbbe; 
        }
        .messages { 
          background: #2f3136; 
          border-radius: 8px; 
          padding: 20px; 
        }
        .message { 
          display: flex; 
          margin-bottom: 15px; 
          align-items: flex-start; 
        }
        .avatar { 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          margin-right: 15px; 
          flex-shrink: 0; 
        }
        .message-content { 
          flex: 1; 
        }
        .message-header { 
          margin-bottom: 5px; 
        }
        .username { 
          font-weight: bold; 
          margin-right: 10px; 
        }
        .bot-tag { 
          background: #5865f2; 
          color: white; 
          padding: 1px 4px; 
          border-radius: 3px; 
          font-size: 10px; 
          margin-right: 10px; 
        }
        .timestamp { 
          color: #72767d; 
          font-size: 12px; 
        }
        .message-body { 
          word-wrap: break-word; 
        }
        .attachment { 
          background: #40444b; 
          padding: 10px; 
          border-radius: 3px; 
          margin-top: 5px; 
        }
        .embed { 
          background: #2f3136; 
          border-left: 4px solid #5865f2; 
          padding: 10px; 
          margin-top: 5px; 
        }
        .embed-title { 
          font-weight: bold; 
          margin-bottom: 5px; 
        }
        .footer { 
          text-align: center; 
          margin-top: 20px; 
          color: #72767d; 
          font-size: 12px; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="channel-name">#${channel.name}</div>
        <div class="stats">
          ${stats.totalMessages} messages • ${stats.participants} participants • 
          Generated on ${formatTimestamp(generatedAt)}
        </div>
      </div>
      <div class="messages">
        ${messages.map(formatMessage).join('')}
      </div>
      <div class="footer">
        Transcript generated by Sapphire Modbot Dashboard
      </div>
    </body>
    </html>
  `;
}
