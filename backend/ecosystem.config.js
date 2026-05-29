module.exports = {
  apps: [
    {
      name: 'pic-portal-backend',
      script: 'dist/server.js',
      cwd: '/var/www/pic-portal/backend',
      instances: 'max',          // Use all CPU cores
      exec_mode: 'cluster',       // Cluster mode for load balancing
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      // Auto-restart settings
      watch: false,
      max_memory_restart: '500M',
      restart_delay: 3000,
      // Logging
      out_file: '/var/log/pm2/pic-portal-out.log',
      error_file: '/var/log/pm2/pic-portal-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
