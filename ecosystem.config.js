// PM2 Ecosystem - Optimized for Raspberry Pi 2 (900MHz ARM, 1GB RAM)
module.exports = {
  apps: [
    {
      name: 'discord-bot',
      script: 'src/bot-with-api.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',  // Restart if exceeds 200MB
      min_uptime: '10s',            // Minimum uptime before considering stable
      max_restarts: 10,             // Max restarts within restart_delay period
      restart_delay: 5000,          // Wait 5s between restarts
      exec_mode: 'fork',            // Fork mode (not cluster)
      node_args: [
        '--max-old-space-size=180', // Limit heap to 180MB
        '--gc-interval=100'         // Aggressive garbage collection
      ].join(' '),
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=180'
      },
      error_file: './logs/discord-bot-error.log',
      out_file: './logs/discord-bot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000
    },
    {
      name: 'pi-bot-api',
      script: 'src/pi-bot-api.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',  // API needs less memory
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 5000,
      exec_mode: 'fork',
      node_args: '--max-old-space-size=120',
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      kill_timeout: 3000,
      wait_ready: false,
      listen_timeout: 8000
    }
  ]
};
