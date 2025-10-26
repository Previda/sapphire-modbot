# 🚀 Quick Start on Raspberry Pi

## After Git Pull

```bash
cd ~/sapphire-modbot
git pull
bash start-bot.sh
```

That's it! The script handles everything automatically.

## What the Script Does

1. ✅ Checks for port conflicts on 3001
2. ✅ Kills any process using port 3001
3. ✅ Stops old bot instances (skyfall-bot, discord-bot)
4. ✅ Starts fresh bot with PM2
5. ✅ Shows you the logs

## If You Get Port Error

Just run the start script again:
```bash
bash start-bot.sh
```

Or manually kill the port:
```bash
npm run kill-port
```

## Check Bot Status

```bash
pm2 status
```

## View Logs

```bash
pm2 logs skyfall-bot
```

## Stop Bot

```bash
pm2 stop skyfall-bot
```

## Restart Bot

```bash
pm2 restart skyfall-bot
```

## Full Restart (if something's broken)

```bash
pm2 delete skyfall-bot
npm run kill-port
bash start-bot.sh
```

---

**That's all you need!** 🎉

For more details, see `PI-SETUP.md`
