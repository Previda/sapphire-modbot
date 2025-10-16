// Generate Discord Bot Invite URL
export default async function handler(req, res) {
  const clientId = process.env.DISCORD_CLIENT_ID || '1358527215020544222';
  
  // Bot permissions (Administrator for full access)
  // You can customize these permissions as needed
  const permissions = [
    'ADMINISTRATOR', // Full admin access (recommended for moderation bots)
    // Or use specific permissions:
    // 'MANAGE_GUILD',
    // 'MANAGE_ROLES',
    // 'MANAGE_CHANNELS',
    // 'KICK_MEMBERS',
    // 'BAN_MEMBERS',
    // 'MANAGE_MESSAGES',
    // 'SEND_MESSAGES',
    // 'VIEW_CHANNEL',
    // 'READ_MESSAGE_HISTORY',
  ];
  
  // Calculate permission value (8 = Administrator)
  const permissionValue = '8'; // Administrator permission
  
  // Generate invite URL
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissionValue}&scope=bot%20applications.commands`;
  
  return res.status(200).json({
    success: true,
    inviteUrl: inviteUrl,
    clientId: clientId,
    permissions: permissionValue,
    scopes: ['bot', 'applications.commands']
  });
}
