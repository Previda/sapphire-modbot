// PM2 Ecosystem - Optimized for Raspberry Pi 2 (900MHz ARM, 1GB RAM)
// Single process - bot-with-api.js includes both bot and API server
module.exports = {
  apps: [
    {
      name: 'discord-bot',
      script: 'src/bot-with-api.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '250M',  // Combined bot + API needs more memory
      min_uptime: '10s',            // Minimum uptime before considering stable
      max_restarts: 10,             // Max restarts within restart_delay period
      restart_delay: 5000,          // Wait 5s between restarts
      exec_mode: 'fork',            // Fork mode (not cluster)
      node_args: '--max-old-space-size=200',
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      },
      error_file: './logs/discord-bot-error.log',
      out_file: './logs/discord-bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000
    }
  ]
};
