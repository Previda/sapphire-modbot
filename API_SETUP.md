# Pi Bot API Connection Setup

## Required Environment Variables

To connect your dashboard to the Pi bot API, you need to configure these environment variables in Vercel:

### 1. Pi Bot API URL
```
PI_BOT_API_URL=http://192.168.1.62:3001
```
- This is the URL where your Pi bot is running
- Default port is 3001
- Must be accessible from Vercel (consider using ngrok or port forwarding for external access)

### 2. Pi Bot Authentication Token
```
PI_BOT_TOKEN=95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af
```
- This token authenticates dashboard requests to the Pi bot
- Generate this token in your Pi bot configuration
- Keep this secure and never expose publicly

## Pi Bot API Endpoints Required

Your Pi bot needs to implement these endpoints:

### Live Data Endpoint
```
GET /live/{serverId}
Authorization: Bearer {PI_BOT_TOKEN}
```
Returns real-time server statistics, music state, moderation data, etc.

### Commands Endpoint  
```
GET /commands/{serverId}
Authorization: Bearer {PI_BOT_TOKEN}
```
Returns all bot commands for the server with their settings and usage stats.

### Analytics Endpoint
```
GET /analytics/{serverId} 
Authorization: Bearer {PI_BOT_TOKEN}
```
Returns performance metrics, uptime, memory usage, etc.

### Verification Endpoint
```
GET /verification/{serverId}
POST /verification/{serverId}
Authorization: Bearer {PI_BOT_TOKEN}
```
Get and update verification system settings.

## Network Setup

### For Local Development:
- Pi bot runs on local network (192.168.1.62:3001)
- Dashboard connects directly to Pi IP
- Ensure Pi firewall allows connections on port 3001

### For Production (Vercel):
- Use ngrok to expose Pi bot: `ngrok http 3001`
- Update PI_BOT_API_URL to ngrok URL: `https://abc123.ngrok.io`
- Or configure router port forwarding: External Port → Pi IP:3001

## Vercel Environment Variables Setup

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `PI_BOT_API_URL` = `http://192.168.1.62:3001` (or ngrok URL)
   - `PI_BOT_TOKEN` = `95f57d784517dc85fae9e8f2fed3155a8296deadd5e2b2484d83bd1e777771af`
3. Deploy your project to apply changes

## Testing Connection

Check if connection works:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://192.168.1.62:3001/live/1340417327518191697
```

## Fallback Behavior

If Pi bot API is unavailable:
- Dashboard shows mock/cached data
- Commands still work with default settings
- Analytics shows "Offline" status
- Users see connection error indicators
