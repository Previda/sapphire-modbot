# 🎵 Music System - Complete Guide

## ✨ What's New

Your bot now has a **fully working music system** using DisTube!

---

## 🚀 Setup on Pi

### **Step 1: Pull Latest Code**
```bash
cd ~/sapphire-modbot
git pull origin main
```

### **Step 2: Install Dependencies**
```bash
npm install
```

This installs:
- `distube` - Music player
- `@discordjs/voice` - Voice connection
- `@discordjs/opus` - Audio codec
- `ffmpeg-static` - Audio processing
- `yt-search` - YouTube search
- `@distube/ytdl-core` - YouTube downloader

### **Step 3: Restart Bot**
```bash
pm2 restart skyfall-bot
pm2 logs skyfall-bot --lines 20
```

You should see:
```
🎵 Music system initialized
```

---

## 🎯 Music Commands

### **Play Music:**
```
/play query:Never Gonna Give You Up
/play query:https://www.youtube.com/watch?v=dQw4w9WgXcQ
/play query:https://open.spotify.com/track/...
```

Supports:
- ✅ YouTube URLs
- ✅ YouTube search
- ✅ Spotify URLs (converts to YouTube)
- ✅ Playlists

### **Skip Song:**
```
/skip
```

### **Stop Music:**
```
/stop
```

Stops playback and clears queue

### **View Queue:**
```
/queue
```

Shows:
- 🎵 Now playing
- ⏭️ Up next (10 songs)
- 📊 Total songs in queue
- 🔊 Current volume

### **Adjust Volume:**
```
/volume level:50
/volume level:100
/volume level:150
```

Range: 0-200 (100 is default)

---

## 🎨 What Users See

### **When Playing:**
```
🎵 Now Playing

Never Gonna Give You Up

⏱️ Duration: 3:32
👤 Requested by: @User
📊 Queue: 5 song(s)

Volume: 100%
```

### **When Adding to Queue:**
```
➕ Added to Queue

Darude - Sandstorm

⏱️ Duration: 3:45
👤 Requested by: @User
📍 Position: #3
```

### **Queue Display:**
```
📋 Music Queue

🎵 Now Playing
Never Gonna Give You Up
⏱️ 3:32 | 👤 @User

⏭️ Up Next
1. Darude - Sandstorm
   ⏱️ 3:45 | 👤 @User

2. Rick Astley - Together Forever
   ⏱️ 3:24 | 👤 @User

➕ More Songs
...and 3 more song(s)

5 song(s) in queue | Volume: 100%
```

---

## 🔧 Features

### **Auto Features:**
- ✅ Leaves when voice channel empty (60s timeout)
- ✅ Auto-plays next song in queue
- ✅ Saves previous songs
- ✅ High quality audio
- ✅ YouTube & Spotify support

### **Queue Management:**
- ✅ Unlimited queue size
- ✅ View queue with `/queue`
- ✅ Skip songs with `/skip`
- ✅ Clear queue with `/stop`

### **Volume Control:**
- ✅ 0-200% volume range
- ✅ Persistent across songs
- ✅ Shows in queue display

---

## 📝 Example Usage

### **Basic Playback:**
```bash
# User joins voice channel
# User runs command:
/play query:lofi hip hop

# Bot joins and plays music
# Bot shows "Now Playing" embed
```

### **Queue Multiple Songs:**
```bash
/play query:song 1
# ✅ Now playing

/play query:song 2
# ➕ Added to queue (#2)

/play query:song 3
# ➕ Added to queue (#3)

/queue
# Shows all 3 songs
```

### **Control Playback:**
```bash
/skip
# ⏭️ Skipped to song 2

/volume level:75
# 🔊 Volume set to 75%

/stop
# ⏹️ Stopped and cleared queue
```

---

## ⚠️ Requirements

### **Bot Permissions:**
- ✅ Connect (to voice channels)
- ✅ Speak (in voice channels)
- ✅ Send Messages
- ✅ Embed Links

### **User Requirements:**
- ✅ Must be in a voice channel
- ✅ Bot must have access to that channel

---

## 🐛 Troubleshooting

### **"Music system not initialized"**
- Run `npm install` on Pi
- Restart bot with `pm2 restart skyfall-bot`
- Check logs: `pm2 logs skyfall-bot`

### **"Failed to play music"**
- Check YouTube URL is valid
- Try searching by name instead
- Check bot has voice permissions

### **No audio playing:**
- Check bot is in voice channel
- Check volume isn't at 0
- Try `/stop` then `/play` again

### **Bot leaves immediately:**
- Make sure you're in the voice channel
- Check bot has "Connect" permission
- Voice channel might be full

---

## 🎯 Advanced Features

### **Playlist Support:**
```
/play query:https://www.youtube.com/playlist?list=...
```

Bot will add all songs to queue!

### **Auto-Leave:**
Bot leaves after 60 seconds if voice channel is empty

### **Previous Songs:**
DisTube saves previous songs for potential "back" command

---

## 📊 Music System Status

After setup, check status:
```bash
pm2 logs skyfall-bot --lines 5
```

Should show:
```
🎵 Music system initialized
✅ Discord bot online!
```

---

## ✅ Summary

**Commands:**
- `/play` - Play music
- `/skip` - Skip current song
- `/stop` - Stop and clear queue
- `/queue` - View queue
- `/volume` - Adjust volume

**Features:**
- ✅ YouTube & Spotify support
- ✅ Unlimited queue
- ✅ High quality audio
- ✅ Auto-leave when empty
- ✅ Volume control (0-200%)

**Status:** 🎵 **Ready to use!**

---

## 🚀 Deploy Now!

```bash
cd ~/sapphire-modbot
git pull origin main
npm install
pm2 restart skyfall-bot
```

Then test in Discord:
```
/play query:test song
```

🎉 **Enjoy your music bot!**
