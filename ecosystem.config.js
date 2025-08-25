module.exports = {
  apps: [{
    name: 'sapphire-bot',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      MAX_MEMORY: '180',
      CPU_LIMIT: '80'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    exec_mode: 'fork',
    node_args: '--max-old-space-size=150',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
