# Dashboard API Configuration

## Environment Variables

Create a `.env.local` file in the dashboard directory with:

```bash
NEXT_PUBLIC_PI_BOT_API_URL=https://your-ngrok-url.ngrok-free.app
```

Replace `your-ngrok-url` with your actual ngrok URL.

## API Endpoints Required

The dashboard expects these endpoints from your Pi bot:

- `GET /api/stats` - Bot statistics
- `GET /api/servers` - List of servers
- `GET /api/moderation/logs` - Moderation logs
- `GET /api/activity/recent` - Recent activity
- `GET /api/status` - Bot status

## Features

- **Real-time Data**: Fetches live data from your Pi bot
- **Auto-refresh**: Updates every 30 seconds
- **Fallback Data**: Shows placeholder data if API is unavailable
- **Loading States**: Smooth loading skeletons while fetching
