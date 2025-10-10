// Pi bot status endpoint for the bot itself to serve
const express = require('express');
const cors = require('cors');

// This should be added to your Pi bot's index.js
const createStatusEndpoint = (client, app) => {
  if (!app) {
    app = express();
    app.use(cors());
    app.use(express.json());
  }

  // Status endpoint
  app.get('/api/status', (req, res) => {
    try {
      const guilds = client.guilds.cache;
      const users = guilds.reduce((acc, guild) => acc + guild.memberCount, 0);
      
      res.json({
        status: 'online',
        botName: 'Skyfall',
        guilds: guilds.size,
        users: users,
        commands: 60,
        uptime: process.uptime(),
        version: '1.0.0',
        port: process.env.API_PORT || 3005,
        timestamp: new Date().toISOString(),
        servers: guilds.map(guild => ({
          id: guild.id,
          name: guild.name,
          members: guild.memberCount,
          status: 'online'
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  return app;
};

module.exports = { createStatusEndpoint };