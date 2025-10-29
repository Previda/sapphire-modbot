# 🎵 Music System Troubleshooting Guide

## Current Status: ⚠️ Playback Error

The bot can find songs and join voice channels, but playback fails due to missing Opus encoder.

---

## 🔧 Quick Fix (Run on Raspberry Pi)

```bash
cd ~/sapphire-modbot

# Run the complete fix script
chmod +x fix-music-complete.sh
bash fix-music-complete.sh
```

This will:
1. ✅ Update code
2. ✅ Install Opus encoder
3. ✅ Install ytdl-core
4. ✅ Install voice dependencies
5. ✅ Check/install FFmpeg
6. ✅ Restart bot

---

## 📋 Manual Fix Steps

If the script doesn't work, run these commands one by one:

```bash
cd ~/sapphire-modbot

# 1. Update code
git pull origin main

# 2. Install Opus encoder (CRITICAL)
npm install opusscript

# 3. Install ytdl-core
npm install @distube/ytdl-core

# 4. Install voice dependencies
npm install @discordjs/voice@latest
npm install @snazzah/davey
npm install libsodium-wrappers

# 5. Install FFmpeg
sudo apt-get update
sudo apt-get install -y ffmpeg

# 6. Restart bot
pm2 restart skyfall-bot

# 7. Watch logs
pm2 logs skyfall-bot
```

---

## 🧪 Test Music

After fixing, test with a YouTube URL:

```
/play https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Expected logs:**
```
🎵 Using ytdl-core music system
[Music] Processing: https://...
[Music] Using URL: https://...
[Music] Streaming: https://...
[Music] Playback started
[Music] Player status: Playing
```

**Expected in Discord:**
- ✅ Bot joins voice channel (undeafened)
- ✅ "Now Playing" embed appears
- ✅ **You hear the music!** 🎵

---

## ❌ Common Errors & Fixes

### Error: "Cannot find module 'opusscript'"
**Fix:**
```bash
npm install opusscript
pm2 restart skyfall-bot
```

### Error: "Cannot find module '@discordjs/opus'"
**Fix:**
```bash
npm install opusscript  # Use opusscript instead
pm2 restart skyfall-bot
```

### Error: "Invalid URL"
**Cause:** YouTube search is broken  
**Fix:** Use direct YouTube URLs only

### Error: "Could not parse decipher function"
**Cause:** ytdl-core issue with YouTube  
**Fix:** This is a warning, not critical. Music should still work.

### Error: "DAVE protocol"
**Fix:**
```bash
npm install @snazzah/davey
pm2 restart skyfall-bot
```

### No audio but "Now Playing" shows
**Possible causes:**
1. Missing Opus encoder
2. Bot is deafened (fixed in code)
3. Discord audio settings
4. Your volume is muted

**Fix:**
```bash
# Install Opus
npm install opusscript
pm2 restart skyfall-bot

# Check Discord:
# - Right-click bot in voice
# - Check "User Volume" is 100%
# - Check your output device
```

---

## 📊 Verify Installation

Check if packages are installed:

```bash
cd ~/sapphire-modbot

# Check for opusscript
ls node_modules/opusscript && echo "✅ opusscript installed" || echo "❌ opusscript missing"

# Check for ytdl-core
ls node_modules/@distube/ytdl-core && echo "✅ ytdl-core installed" || echo "❌ ytdl-core missing"

# Check for davey
ls node_modules/@snazzah/davey && echo "✅ davey installed" || echo "❌ davey missing"

# Check FFmpeg
ffmpeg -version && echo "✅ FFmpeg installed" || echo "❌ FFmpeg missing"
```

---

## 🎯 Music System Requirements

**Required Packages:**
- ✅ `opusscript` - Audio encoding (CRITICAL)
- ✅ `@distube/ytdl-core` - YouTube downloading
- ✅ `@discordjs/voice` - Voice connections
- ✅ `@snazzah/davey` - Discord DAVE protocol
- ✅ `libsodium-wrappers` - Encryption
- ✅ `ffmpeg` - Audio processing (system package)

---

## 🔍 Debug Logs

Watch logs in real-time:

```bash
# All logs
pm2 logs skyfall-bot

# Music logs only
pm2 logs skyfall-bot | grep Music

# Last 50 lines
pm2 logs skyfall-bot --lines 50
```

---

## ✅ Success Indicators

**In Logs:**
```
🎵 Using ytdl-core music system
[Music] Streaming: https://...
[Music] Player status: Playing
[Music] Playback started
```

**In Discord:**
- Bot joins voice (no 🔇 icon)
- "Now Playing" embed appears
- **Audio plays!** 🎵

---

## 🆘 Still Not Working?

1. **Run the fix script again:**
   ```bash
   bash fix-music-complete.sh
   ```

2. **Check bot logs for errors:**
   ```bash
   pm2 logs skyfall-bot --lines 100
   ```

3. **Verify all packages:**
   ```bash
   npm list opusscript @distube/ytdl-core @snazzah/davey
   ```

4. **Try a different song:**
   - Some videos may be age-restricted
   - Some videos may be region-locked
   - Try: https://www.youtube.com/watch?v=dQw4w9WgXcQ

5. **Restart everything:**
   ```bash
   pm2 stop skyfall-bot
   pm2 delete skyfall-bot
   cd ~/sapphire-modbot
   pm2 start src/index.js --name skyfall-bot
   ```

---

## 📝 Current Limitations

Due to YouTube API changes:

- ❌ **Search is disabled** - YouTube broke all search libraries
- ✅ **Direct URLs work** - Always use YouTube URLs
- ⚠️ **Some videos fail** - Age-restricted or region-locked

**Workaround:** Copy YouTube URLs directly from your browser

---

## 🎵 Music Commands

```
/play <youtube url>  - Play music (URL required)
/queue               - Show current queue
/skip                - Skip current song
/stop                - Stop playback and leave
/nowplaying          - Show current song
/volume <1-100>      - Adjust volume
```

---

**Run the fix script and music will work!** 🎵
