// PM2 Ecosystem - Optimized for Raspberry Pi 2 (900MHz ARM Cortex-A7, 1GB RAM)
// Tuned for low-resource environment with aggressive memory management
module.exports = {
  apps: [
    {
      name: 'skyfall-bot',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',   // Restart if memory exceeds 400MB (Pi 2 has 1GB total)
      min_uptime: '15s',             // Minimum uptime before considering stable
      max_restarts: 5,               // Limit restarts to prevent boot loops
      restart_delay: 10000,          // Wait 10s between restarts to prevent rapid cycling
      exec_mode: 'fork',             // Fork mode (cluster not needed for single bot)
      node_args: [
        '--max-old-space-size=384',  // Limit heap to 384MB (leaves room for system)
        '--gc-interval=100',          // Run garbage collection more frequently
        '--optimize-for-size'         // Optimize for memory over speed
      ].join(' '),
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        UV_THREADPOOL_SIZE: 2        // Reduce thread pool (default 4) for Pi 2
      },
      error_file: './logs/skyfall-bot-error.log',
      out_file: './logs/skyfall-bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 15000,         // Give more time for slow Pi 2 startup
      // Cron restart at 4 AM daily to clear memory leaks
      cron_restart: '0 4 * * *',
      // Exponential backoff for restarts
      exp_backoff_restart_delay: 100
    }
  ]
};
