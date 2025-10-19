# 🎨 Sapphire ModBot Dashboard

A beautiful, modern, and smooth web dashboard for managing your Discord moderation bot.

## ✨ Features

- 🎨 **Modern UI** - Clean, professional design with smooth animations
- 🔐 **Discord OAuth** - Secure authentication with Discord
- 📊 **Real-time Stats** - Live server statistics and analytics
- ⚡ **Fast Performance** - Optimized for speed and responsiveness
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🌙 **Dark Mode** - Beautiful dark theme (light mode coming soon)
- 🎭 **Smooth Animations** - Transitions and micro-interactions everywhere

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Discord bot running
- Discord OAuth application setup

### Installation

```bash
cd dashboard
npm install
```

### Environment Variables

Create `.env.local`:

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback

# JWT Secret
JWT_SECRET=your_random_secret_key_here

# Bot API
BOT_API_URL=http://localhost:3001

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── app/                 # Next.js 14 App Router
│   │   ├── (auth)/         # Auth pages
│   │   ├── (dashboard)/    # Dashboard pages
│   │   ├── api/            # API routes
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   ├── dashboard/     # Dashboard components
│   │   └── auth/          # Auth components
│   ├── lib/               # Utilities
│   │   ├── auth.ts        # Auth helpers
│   │   ├── api.ts         # API client
│   │   └── utils.ts       # Utilities
│   ├── hooks/             # Custom hooks
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── public/                # Static assets
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: `#5865F2` (Discord Blurple)
- **Success**: `#57F287`
- **Warning**: `#FEE75C`
- **Error**: `#ED4245`
- **Background**: `#2C2F33`
- **Surface**: `#23272A`

### Typography
- **Font**: Inter
- **Headings**: 24-32px, Bold
- **Body**: 14-16px, Regular
- **Code**: JetBrains Mono

### Animations
- **Duration**: 200-400ms
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Types**: Fade, Slide, Scale, Blur

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State**: Zustand
- **Data Fetching**: SWR
- **Auth**: NextAuth.js
- **Icons**: Lucide React

## 🔐 Authentication Flow

1. User clicks "Login with Discord"
2. Redirect to Discord OAuth
3. Discord returns authorization code
4. Exchange code for access token
5. Fetch user info and guilds
6. Check admin permissions
7. Generate JWT token
8. Store in httpOnly cookie
9. Redirect to dashboard

## 📊 API Endpoints

### Authentication
- `GET /api/auth/login` - Initiate Discord OAuth
- `GET /api/auth/callback` - OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Guilds
- `GET /api/guilds` - List user's guilds
- `GET /api/guilds/:id` - Guild details
- `PATCH /api/guilds/:id` - Update guild settings

### Commands
- `GET /api/commands` - List all commands
- `PATCH /api/commands/:id` - Update command
- `POST /api/commands/:id/toggle` - Enable/disable

### Moderation
- `GET /api/cases` - List cases
- `GET /api/cases/:id` - Case details
- `GET /api/appeals` - List appeals
- `PATCH /api/appeals/:id` - Update appeal

### Statistics
- `GET /api/stats` - Server statistics
- `GET /api/stats/commands` - Command usage
- `GET /api/stats/moderation` - Mod actions

## 🎭 Components

### UI Components
```tsx
<Button variant="primary" size="md">Click me</Button>
<Card elevated>Content</Card>
<Modal open={true}>Modal content</Modal>
<Input placeholder="Enter text" />
<Switch checked={true} />
<Badge variant="success">Active</Badge>
<Avatar src="/avatar.png" />
<Skeleton />
<Toast message="Success!" />
```

### Dashboard Components
```tsx
<Sidebar />
<Header />
<StatsCard />
<CommandCard />
<CaseCard />
<AppealCard />
<Chart data={data} />
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Docker
```bash
docker build -t modbot-dashboard .
docker run -p 3000:3000 modbot-dashboard
```

### Manual
```bash
npm run build
npm start
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📧 Support

- Discord: [Join our server](https://discord.gg/your-server)
- Email: support@example.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**Made with ❤️ by Skyfall Team**
