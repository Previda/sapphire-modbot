# 🍓 Raspberry Pi 2 - Quick Reference Card

## 🚀 Essential Commands

### Start Bot
```bash
bash start-pi2.sh
```
Auto-detects Pi 2 and applies optimizations

### Monitor Bot
```bash
bash monitor-pi2.sh
```
Real-time performance monitoring

### View Logs
```bash
pm2 logs skyfall-bot
```

### Restart Bot
```bash
pm2 restart skyfall-bot
```

### Stop Bot
```bash
pm2 stop skyfall-bot
```

---

## 📊 Performance Targets

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| Memory | 200-300MB | 300-380MB | >400MB (auto-restart) |
| CPU | 15-25% | 40-60% | >80% |
| Temp | <60°C | 60-75°C | >75°C |
| Uptime | Days | Hours | Minutes |

---

## ⚡ Optimizations Active

- ✅ Memory limit: 400MB
- ✅ Heap size: 384MB  
- ✅ Cache limits: Aggressive
- ✅ GC interval: Every minute
- ✅ Thread pool: 2 (vs 4)
- ✅ Daily restart: 4:00 AM
- ✅ Sweepers: Active

---

## 🔧 Quick Fixes

### High Memory
```bash
pm2 restart skyfall-bot
```

### High CPU
```bash
pm2 restart skyfall-bot
```

### Bot Offline
```bash
bash start-pi2.sh
```

### Disk Full
```bash
pm2 flush
```

### System Slow
```bash
sudo sync
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'
```

---

## 📈 Monitoring

### Quick Status
```bash
pm2 status
```

### Memory Usage
```bash
pm2 describe skyfall-bot | grep memory
```

### Full Monitor
```bash
bash monitor-pi2.sh
```

### System Resources
```bash
htop
```

---

## ⚠️ Warning Signs

| Sign | Meaning | Action |
|------|---------|--------|
| Memory >350MB | Approaching limit | Monitor closely |
| CPU >70% | High load | Check active commands |
| Temp >70°C | Overheating | Improve cooling |
| Frequent restarts | Memory leaks | Check logs |
| Slow responses | Resource exhaustion | Restart bot |

---

## 🆘 Emergency

### Bot Won't Start
1. Check logs: `pm2 logs skyfall-bot --lines 50`
2. Check .env: `cat .env`
3. Run setup: `node setup-bot.js`
4. Try manual start: `node src/index.js`

### System Frozen
```bash
sudo reboot
```

### Out of Memory
```bash
pm2 stop skyfall-bot
sudo sync
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'
pm2 start skyfall-bot
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `start-pi2.sh` | Optimized startup |
| `monitor-pi2.sh` | Performance monitor |
| `ecosystem.config.js` | PM2 configuration |
| `.env` | Bot credentials |
| `PI2-OPTIMIZATION.md` | Full documentation |

---

## 💡 Pro Tips

1. **Monitor regularly:** `bash monitor-pi2.sh`
2. **Enable swap:** Prevents OOM crashes
3. **Keep updated:** `git pull origin main`
4. **Clear logs weekly:** `pm2 flush`
5. **Restart if slow:** `pm2 restart skyfall-bot`

---

## 🎯 Expected Performance

- **Startup:** 20-30 seconds
- **Memory:** 200-350MB
- **CPU (idle):** 15-25%
- **Response time:** 1-3 seconds
- **Uptime:** Days to weeks

---

## 📞 Need Help?

1. Check `PI2-OPTIMIZATION.md` for detailed guide
2. Check `QUICK-FIX.md` for troubleshooting
3. View logs: `pm2 logs skyfall-bot`
4. Monitor: `bash monitor-pi2.sh`

---

**Print this and keep it handy!** 📋
