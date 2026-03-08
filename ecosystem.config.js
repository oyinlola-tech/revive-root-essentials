const path = require('path');

// ============================================================================
// PM2 ECOSYSTEM CONFIGURATION - PRODUCTION DEPLOYMENT
// ============================================================================
// 
// This file configures PM2 process manager for production deployment.
// 
// Installation:
//   npm install -g pm2
//   cd /path/to/revive-root-essentials
//   pm2 start ecosystem.config.js
// 
// Management Commands:
//   pm2 status              # Check all processes
//   pm2 logs                # View logs in real-time
//   pm2 logs backend        # View backend logs
//   pm2 logs frontend       # View frontend logs
//   pm2 restart ecosystem.config.js
//   pm2 stop ecosystem.config.js
//   pm2 delete ecosystem.config.js
//   pm2 save                # Save process list
//   pm2 resurrect           # Restore process list on restart
//   pm2 monit               # Monitor in real-time
// 
// ============================================================================

module.exports = {
  apps: [
    // ========================================================================
    // BACKEND APPLICATION (Express.js)
    // ========================================================================
    {
      name: 'revive-backend',
      script: './backend/server.js',
      cwd: path.resolve(__dirname),
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        LOG_LEVEL: 'info'
      },
      
      // Cluster mode for load balancing across CPU cores
      instances: 'max',    // Use all available CPU cores
      exec_mode: 'cluster',
      
      // Watch for file changes (set to false in production for stability)
      watch: false,
      
      // Ignore patterns
      ignore_watch: [
        'node_modules',
        'logs',
        'tmp',
        '.git',
        '.env'
      ],
      
      // Restart on crash
      autorestart: true,
      
      // Max memory before restart (500MB)
      max_memory_restart: '500M',
      
      // Error logging
      error_file: '/var/log/revive-root-essentials/backend-error.log',
      out_file: '/var/log/revive-root-essentials/backend-out.log',
      log_file: '/var/log/revive-root-essentials/backend-combined.log',
      
      // Log format with timestamp
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process priority (higher = more important, restarts first)
      priority: 10,
      
      // Graceful shutdown
      kill_timeout: 5000,     // 5 seconds to gracefully shutdown
      wait_ready: false,      // Wait for 'ready' message
      listen_timeout: 10000,  // 10 seconds to establish connection
      
      // Restart policies
      min_uptime: '10s',      // Minimum uptime before counting as "crashed"
      max_restarts: 10,       // Max restarts in 1 minute
      min_uptime_for_restart: '1m', // Wait 1 min after crash before restarting
      
      // Additional environment
      merge_logs: true,
      kill_timeout: 5000,
      wait_ready: false,
      
      // Health check endpoint
      health_check: {
        enabled: true,
        endpoint: 'https://api.revive-root-essentials.telente.site/health',
        interval: 30000    // Check every 30 seconds
      }
    },
    
    // ========================================================================
    // FRONTEND APPLICATION (Vite/React)
    // ========================================================================
    {
      name: 'revive-frontend',
      script: './node_modules/vite/bin/vite.js',
      cwd: path.resolve(__dirname),
      args: 'preview --port 5173 --host 0.0.0.0',
      
      // Environment
      env: {
        NODE_ENV: 'production'
      },
      
      // Single instance for frontend
      instances: 1,
      exec_mode: 'fork',
      
      // Restart on crash
      autorestart: true,
      
      // Max memory (300MB for frontend)
      max_memory_restart: '300M',
      
      // Logging
      error_file: '/var/log/revive-root-essentials/frontend-error.log',
      out_file: '/var/log/revive-root-essentials/frontend-out.log',
      log_file: '/var/log/revive-root-essentials/frontend-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Priority (lower than backend)
      priority: 5,
      
      // Graceful shutdown
      kill_timeout: 5000,
      
      // Merge logs
      merge_logs: true
    }
  ],
  
  // ============================================================================
  // DEPLOYMENT CONFIGURATION
  // ============================================================================
  deploy: {
    production: {
      user: 'app-user',
      host: 'your-production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:oyinlola-tech/revive-root-essentials.git',
      path: '/var/www/revive-root-essentials',
      'post-deploy': 'npm install && npm run build && pm2 restart ecosystem.config.js'
    }
  },
  
  // ============================================================================
  // MONITORING CONFIGURATION
  // ============================================================================
  ignore_watch: ['node_modules', 'logs'],
  watch: false,  // Disable watch in production
  
  // Advanced PM2 settings
  max_restarts: 10,
  min_uptime: '10s',
  
  // Error handling
  error_file: '/var/log/revive-root-essentials/pm2-error.log',
  out_file: '/var/log/revive-root-essentials/pm2-out.log'
};

// ============================================================================
// SETUP INSTRUCTIONS
// ============================================================================
// 
// 1. Create log directory:
//    sudo mkdir -p /var/log/revive-root-essentials
//    sudo chown app-user:app-user /var/log/revive-root-essentials
//
// 2. Install PM2 globally:
//    npm install -g pm2
//
// 3. Ensure .env.production is configured:
//    cp .env.production.example .env.production
//    Edit .env.production with production values
//
// 4. Start PM2 process:
//    pm2 start ecosystem.config.js
//
// 5. Save PM2 process list:
//    pm2 save
//
// 6. Generate startup script:
//    pm2 startup systemd -u app-user --hp /home/app-user
//
// 7. Verify processes are running:
//    pm2 status
//    pm2 logs
//
// 8. Restart services:
//    pm2 restart all
//
// ============================================================================
