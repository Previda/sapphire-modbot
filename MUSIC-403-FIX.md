# 🚫 YouTube 403 Error Fix Guide

## ❌ What is a 403 Error?

A **403 Forbidden** error means YouTube is blocking access to the video. This is **NOT a bot bug** - it's YouTube protecting certain content.

---

## 🔍 Common Causes

### **1. Age-Restricted Videos**
- Videos marked 18+ or mature content
- YouTube requires sign-in to verify age
- Bot cannot sign in, so it fails

### **2. Region-Locked Content**
- Video not available in your country
- Music videos often have regional restrictions
- Some content is US-only or EU-only

### **3. Rate Limiting**
- Playing too many videos too quickly
- YouTube temporarily blocks your IP
- Usually resolves after 10-30 minutes

### **4. Sign-In Required**
- Some videos require YouTube account
- Private or unlisted videos
- Premium content

---

## ✅ Solutions

### **Quick Fixes:**

1. **Try a Different Video**
   - Find the same song from a different uploader
   - Look for "official audio" versions (less restricted)
   - Avoid "explicit" or "18+" versions

2. **Wait and Retry**
   - If rate limited, wait 10-30 minutes
   - Don't spam play commands
   - Give YouTube's servers a break

3. **Use Official Uploads**
   - Official artist channels are less restricted
   - Topic channels (auto-generated) work better
   - Avoid reuploads or fan uploads

4. **Check Video Availability**
   - Open the video in your browser first
   - If it asks for age verification, bot can't play it
   - If it says "not available in your country", bot can't access it

---

## 🎯 Best Practices

### **Videos That Usually Work:**
✅ Official music videos (non-explicit)  
✅ Topic channel uploads  
✅ Public, non-restricted content  
✅ Popular songs from major artists  
✅ Older videos (less likely to be restricted)  

### **Videos That Often Fail:**
❌ Age-restricted (18+) content  
❌ Explicit versions of songs  
❌ Region-locked music videos  
❌ Recently uploaded videos (may have restrictions)  
❌ Reuploads or unofficial versions  

---

## 🔧 Technical Details

### **What the Bot Does:**
1. Adds proper User-Agent headers
2. Uses high-quality audio streams
3. Handles 403 errors gracefully
4. Auto-skips to next song on error
5. Shows clear error messages

### **What the Bot Can't Do:**
- ❌ Bypass age restrictions
- ❌ Access region-locked content
- ❌ Sign in to YouTube
- ❌ Play premium/paid content
- ❌ Override YouTube's rate limits

---

## 📝 Examples

### **Good URLs (Usually Work):**
```
✅ https://www.youtube.com/watch?v=dQw4w9WgXcQ
   (Rick Astley - Never Gonna Give You Up)

✅ https://www.youtube.com/watch?v=kJQP7kiw5Fk
   (Luis Fonsi - Despacito)

✅ https://www.youtube.com/watch?v=9bZkp7q19f0
   (PSY - Gangnam Style)
```

### **URLs That May Fail:**
```
❌ Age-restricted videos
❌ Music videos with explicit lyrics
❌ Region-locked content
❌ Private/unlisted videos
```

---

## 🆘 Troubleshooting

### **If You Get 403 Errors:**

**Step 1: Check the Video**
- Open it in your browser
- Does it require age verification?
- Does it say "not available in your country"?
- Is it private or deleted?

**Step 2: Try Alternatives**
- Search for the same song
- Find a different upload
- Look for "official audio" or "topic" versions
- Try a non-explicit version

**Step 3: Wait and Retry**
- If rate limited, wait 15-30 minutes
- Don't spam the bot with requests
- Try a different video first

**Step 4: Check Bot Status**
- Is the bot online?
- Are other commands working?
- Check logs: `pm2 logs skyfall-bot`

---

## 🎵 Alternative Solutions

### **If Music Bot Keeps Failing:**

1. **Use a Dedicated Music Bot**
   - Groovy (if available)
   - Rythm (if available)
   - Hydra
   - FredBoat
   - These have better YouTube access

2. **Use Spotify Integration**
   - Some bots support Spotify
   - Better for music playback
   - Fewer restrictions

3. **Self-Host with VPN**
   - Use VPN to change region
   - May bypass some restrictions
   - Not guaranteed to work

---

## 📊 Error Messages Explained

### **"YouTube Access Blocked (403)"**
- YouTube is blocking the video
- Try a different video
- Wait if rate limited

### **"Video Unavailable"**
- Video is private, deleted, or doesn't exist
- Find a different upload
- Check the URL

### **"Playback Error"**
- Generic error
- Check logs for details
- May be temporary

---

## 🔄 Bot Improvements

### **What We Added:**
✅ Better error messages for 403 errors  
✅ User-Agent headers to avoid blocks  
✅ Auto-skip to next song on error  
✅ Clear explanations of why it failed  
✅ Suggestions for fixing the issue  

### **What We Can't Fix:**
❌ YouTube's restrictions (their rules)  
❌ Age-restricted content (requires login)  
❌ Region locks (geographic restrictions)  
❌ Rate limiting (YouTube's protection)  

---

## 💡 Pro Tips

1. **Build a Playlist of Working Videos**
   - Test videos before adding to queue
   - Keep a list of reliable URLs
   - Share working links with server

2. **Avoid Peak Hours**
   - YouTube may rate limit more during busy times
   - Try playing music during off-peak hours
   - Spread out requests

3. **Use Official Sources**
   - Official artist channels
   - Topic channels (auto-generated by YouTube)
   - Verified uploaders

4. **Check Before Playing**
   - Open video in browser first
   - Make sure it's public and accessible
   - Verify it's not age-restricted

---

## 📞 Still Having Issues?

### **Check These:**
- [ ] Is the video public?
- [ ] Does it work in your browser without sign-in?
- [ ] Is it available in your country?
- [ ] Have you tried a different video?
- [ ] Have you waited 15+ minutes if rate limited?

### **Get Help:**
```bash
# Check bot logs
pm2 logs skyfall-bot

# Restart bot
pm2 restart skyfall-bot

# Update bot
cd ~/sapphire-modbot
git pull origin main
pm2 restart skyfall-bot
```

---

## ✅ Summary

**403 errors are usually caused by:**
1. Age-restricted videos
2. Region-locked content
3. Rate limiting
4. Sign-in required videos

**Solutions:**
1. Try different videos
2. Use official uploads
3. Wait if rate limited
4. Avoid restricted content

**Remember:** This is a YouTube limitation, not a bot bug!

---

**The bot now handles 403 errors better with:**
- ✅ Clear error messages
- ✅ Auto-skip to next song
- ✅ Better headers to avoid blocks
- ✅ Helpful suggestions

**But it still can't bypass YouTube's restrictions!**
