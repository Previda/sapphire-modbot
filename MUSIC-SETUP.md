# 🎵 Music System Setup Guide

## Issue: Playback Error

The music system can find songs but fails to play them. This is usually due to `play-dl` not being properly configured.

---

## 🔧 Fix on Raspberry Pi:

### 1. Install/Update Dependencies
```bash
cd ~/sapphire-modbot
npm install play-dl@latest
npm install @discordjs/voice@latest
npm install ffmpeg-static
npm install sodium libsodium-wrappers
```

### 2. Install System Dependencies
```bash
# Install FFmpeg (required for audio processing)
sudo apt-get update
sudo apt-get install -y ffmpeg

# Verify FFmpeg is installed
ffmpeg -version
```

### 3. Update and Restart Bot
```bash
cd ~/sapphire-modbot
git pull origin main
pm2 restart skyfall-bot
pm2 logs skyfall-bot --lines 50
```

---

## 🧪 Test Music System:

```
/play never gonna give you up
```

Watch the logs for detailed error messages:
```bash
pm2 logs skyfall-bot | grep Music
```

---

## 🔍 Common Issues:

### Issue 1: "Failed to get audio stream"
**Cause:** YouTube API rate limiting or region restrictions  
**Solution:**
- Try a different song
- Wait a few minutes
- Use direct YouTube URLs instead of search

### Issue 2: "Invalid stream received"
**Cause:** FFmpeg not installed or play-dl not configured  
**Solution:**
```bash
sudo apt-get install ffmpeg
npm install play-dl@latest --save
pm2 restart skyfall-bot
```

### Issue 3: "Age-restricted video"
**Cause:** Video requires YouTube login  
**Solution:**
- Try a different song
- Use non-age-restricted content

### Issue 4: Voice connection issues
**Cause:** Missing voice dependencies  
**Solution:**
```bash
npm install sodium libsodium-wrappers
pm2 restart skyfall-bot
```

---

## 📊 Check Logs:

```bash
# Watch live logs
pm2 logs skyfall-bot

# Search for music errors
pm2 logs skyfall-bot | grep -i "music\|play\|stream"

# Check last 100 lines
pm2 logs skyfall-bot --lines 100
```

---

## ✅ What Should Work:

After fixing:
- ✅ `/play <song name>` - Search and play
- ✅ `/play <youtube url>` - Direct URL
- ✅ `/queue` - Show queue
- ✅ `/skip` - Skip song
- ✅ `/stop` - Stop playback
- ✅ `/nowplaying` - Current song
- ✅ `/volume` - Adjust volume

---

## 🎯 Full Setup Commands:

Run these on your Raspberry Pi:

```bash
# 1. Update system
sudo apt-get update
sudo apt-get install -y ffmpeg

# 2. Update bot
cd ~/sapphire-modbot
git pull origin main

# 3. Install dependencies
npm install

# 4. Restart bot
pm2 restart skyfall-bot

# 5. Watch logs
pm2 logs skyfall-bot --lines 50
```

---

## 💡 Alternative: Disable Music

If music continues to fail, you can disable it:

```bash
cd ~/sapphire-modbot/src/commands
mv music music.disabled
pm2 restart skyfall-bot
```

---

## 📝 Error Messages Explained:

### "Failed to play song: Failed to get audio stream"
- YouTube API issue
- Try again in a few minutes
- Use different search terms

### "This might be due to: Age-restricted video"
- Video requires login
- Try non-restricted content

### "Region-locked content"
- Video not available in your region
- Try different song

### "YouTube API issues"
- Temporary YouTube problem
- Wait and try again

---

## 🚀 After Setup:

Test with these commands:
```
/play test
/play https://www.youtube.com/watch?v=dQw4w9WgXcQ
/queue
/nowplaying
```

---

**Status:** 🔧 NEEDS SETUP  
**Priority:** Medium  
**Estimated Time:** 5-10 minutes
