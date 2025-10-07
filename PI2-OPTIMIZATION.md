# 🥧 Raspberry Pi 2 Optimization Guide

This guide provides specific optimizations for running Sapphire Modbot on Raspberry Pi 2, which has limited resources (1GB RAM, 900MHz quad-core CPU).

## 🔧 Pi 2 Specifications
- **CPU**: 900MHz quad-core ARM Cortex-A7
- **RAM**: 1GB LPDDR2
- **Storage**: MicroSD (Class 10 recommended)
- **Network**: 100Mbps Ethernet

## ⚡ Automatic Optimizations

The factory installer automatically applies these Pi 2 optimizations:

### Memory Management
- **Heap Size**: Limited to 200MB (vs 400MB on Pi 4)
- **Garbage Collection**: More frequent (15s vs 30s)
- **Cache Limits**: Reduced to 500 items (vs 1000)
- **Log Retention**: Only 50 entries in memory

### Performance Tuning
- **Command Cooldown**: 2 seconds (vs 1 second)
- **Concurrent Commands**: Max 2 (vs 5)
- **Cache Timeout**: 3 minutes (vs 5 minutes)
- **Node.js Version**: 16.x (better Pi 2 compatibility)

### Resource Limits
- **Bot Service**: 250MB RAM, 30% CPU
- **API Service**: 128MB RAM, 20% CPU
- **Total Usage**: ~378MB RAM, 50% CPU maximum

## 🚀 Installation

Use the same one-command installer:

```bash
curl -sSL https://raw.githubusercontent.com/Previda/sapphire-modbot/main/pi-factory-installer.sh | bash
```

The installer automatically detects and optimizes for Pi 2.

## 📊 Expected Performance

### Resource Usage
- **Idle RAM**: ~60-80MB
- **Active RAM**: ~120-180MB
- **CPU Usage**: 15-25% average
- **Boot Time**: 45-60 seconds
- **Command Response**: 1-3 seconds

### Music Streaming
- **Quality**: Low (to save CPU/bandwidth)
- **Queue Size**: 25 songs maximum
- **Timeout**: 45 seconds (longer for processing)
- **Fallback**: 2 attempts (vs 3 on Pi 4)

## 🔧 Manual Optimizations

### System Level

1. **Disable Unnecessary Services**:
```bash
sudo systemctl disable bluetooth
sudo systemctl disable cups
sudo systemctl disable avahi-daemon
sudo systemctl disable triggerhappy
```

2. **Optimize Boot**:
```bash
# Add to /boot/config.txt
gpu_mem=16          # Minimal GPU memory
disable_camera_led=1
disable_splash=1
boot_delay=0
```

3. **Swap Configuration**:
```bash
# Reduce swappiness
echo 'vm.swappiness=1' | sudo tee -a /etc/sysctl.conf

# Optional: Disable swap entirely if you have fast SD card
sudo dphys-swapfile swapoff
sudo systemctl disable dphys-swapfile
```

### Application Level

1. **Environment Variables**:
```bash
# Add to .env
MAX_MEMORY=200
LOG_LEVEL=warn
NODE_ENV=production
```

2. **Node.js Flags**:
```bash
export NODE_OPTIONS="--max-old-space-size=200 --gc-interval=50 --optimize-for-size"
```

## 🎵 Music System Optimizations

### Audio Quality Settings
```javascript
// Automatically applied in lightweight-config.js
music: {
    maxQueueSize: 25,
    audioQuality: 'low',        // Reduces CPU usage
    enableCache: false,         // Saves storage
    timeout: 45000,            // Longer processing time
    retryAttempts: 2           // Fewer retries
}
```

### Streaming Fallbacks
1. **play-dl** (primary) - Most efficient
2. **ytdl-core** (fallback) - Moderate CPU usage
3. **yt-dlp** (last resort) - Higher CPU but reliable

## 📈 Monitoring

### Check Resource Usage
```bash
# Memory usage
free -h

# CPU usage
htop

# Service status
sudo systemctl status sapphire-bot sapphire-api

# Real-time logs
sudo journalctl -u sapphire-bot -f
```

### Health Monitoring
```bash
# Check health status
curl http://localhost:3001/health

# View health file
cat /tmp/sapphire-health.json
```

## 🚨 Troubleshooting

### High Memory Usage
If memory usage exceeds 180MB:
1. Bot automatically restarts
2. Check for memory leaks in logs
3. Reduce queue size further if needed

### Slow Performance
1. **Check SD Card Speed**:
```bash
sudo hdparm -t /dev/mmcblk0
# Should be >10MB/s for Class 10
```

2. **Monitor Temperature**:
```bash
vcgencmd measure_temp
# Should be <70°C
```

3. **Reduce Features**:
   - Disable music if not needed
   - Increase command cooldowns
   - Reduce verification cache

### Connection Issues
1. **Network Optimization**:
```bash
# Add to /etc/dhcpcd.conf
interface eth0
static ip_address=192.168.1.62/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8
```

2. **DNS Optimization**:
```bash
# Use faster DNS
echo 'nameserver 1.1.1.1' | sudo tee /etc/resolv.conf
```

## 🔄 Updates

Update the bot while preserving Pi 2 optimizations:

```bash
cd /home/admin/sapphire-modbot
./update.sh
```

The update script preserves your optimized configuration.

## 💡 Tips for Best Performance

1. **Use Fast SD Card**: Class 10 or better
2. **Adequate Power Supply**: 2.5A minimum
3. **Good Cooling**: Heatsink recommended
4. **Wired Network**: Ethernet preferred over WiFi
5. **Regular Maintenance**: Update system monthly

## 📋 Performance Checklist

- ✅ Using Node.js 16.x
- ✅ Memory limit set to 200MB
- ✅ CPU quota set to 50% total
- ✅ Unnecessary services disabled
- ✅ Swap optimized or disabled
- ✅ Fast SD card (Class 10+)
- ✅ Adequate cooling
- ✅ Stable power supply

## 🎯 Expected Results

With these optimizations, your Pi 2 should:
- **Boot**: Complete startup in ~60 seconds
- **Memory**: Use <200MB RAM total
- **CPU**: Average 20-30% usage
- **Response**: Commands respond in 1-3 seconds
- **Uptime**: 99%+ reliability with auto-restart
- **Music**: Stream low-quality audio smoothly

## 🆘 Support

If you experience issues:
1. Check the troubleshooting section above
2. Monitor resource usage with `htop`
3. Check logs with `sudo journalctl -u sapphire-bot -f`
4. Ensure adequate power supply and cooling

Your Pi 2 can successfully run Sapphire Modbot 24/7 with these optimizations!
