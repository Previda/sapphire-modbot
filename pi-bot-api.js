const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'User-Agent'],
    credentials: true
}));

app.use(express.json());

const port = process.env.PORT || 3004;

// Bot data storage
let botData = {
    guilds: [],
    commands: [],
    logs: [
        { id: 1, action: 'Bot started', user: 'System', details: 'Pi bot API server started', type: 'system', timestamp: new Date().toISOString() }
    ],
    appeals: [],
    startTime: Date.now(),
    botStatus: 'waiting for Discord bot'
};

// Status endpoint
app.get('/api/status', (req, res) => {
    const uptime = Math.floor((Date.now() - botData.startTime) / 1000);
    
    res.json({
        status: botData.botStatus,
        uptime: uptime,
        version: '2.0.0',
        guilds: botData.guilds.length,
        users: botData.guilds.reduce((acc, guild) => acc + (guild.memberCount || 0), 0),
        commands: botData.commands.length,
        ping: 42,
        timestamp: new Date().toISOString(),
        realData: true
    });
});

// Guilds endpoint
app.get('/api/guilds', (req, res) => {
    res.json({
        success: true,
        guilds: botData.guilds,
        count: botData.guilds.length,
        realData: true
    });
});

// Commands management endpoint
app.get('/api/commands/manage', (req, res) => {
    res.json({
        success: true,
        commands: botData.commands,
        realData: true
    });
});

app.put('/api/commands/manage', (req, res) => {
    const { commandId, enabled, description, cooldown } = req.body;
    
    const command = botData.commands.find(cmd => cmd.id === commandId);
    if (command) {
        if (typeof enabled === 'boolean') command.enabled = enabled;
        if (description) command.description = description;
        if (typeof cooldown === 'number') command.cooldown = cooldown;
        
        botData.logs.unshift({
            id: Date.now(),
            action: 'Command updated',
            user: 'Dashboard',
            details: `Updated ${command.name}: enabled=${enabled}`,
            type: 'command',
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            command: command,
            message: 'Command updated successfully',
            realData: true
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Command not found'
        });
    }
});

// Logs endpoint
app.get('/api/logs', (req, res) => {
    res.json({
        success: true,
        logs: botData.logs.slice(0, 50),
        total: botData.logs.length,
        realData: true
    });
});

// Appeals endpoints
app.get('/api/appeals', (req, res) => {
    res.json({
        success: true,
        appeals: botData.appeals,
        realData: true
    });
});

app.post('/api/appeals', (req, res) => {
    const { username, banReason, appealMessage } = req.body;
    
    const appeal = {
        id: Date.now(),
        username,
        banReason,
        appealMessage,
        status: 'pending',
        submittedAt: new Date().toISOString()
    };
    
    botData.appeals.push(appeal);
    
    botData.logs.unshift({
        id: Date.now(),
        action: 'Appeal submitted',
        user: username,
        details: `New ban appeal from ${username}`,
        type: 'appeal',
        timestamp: new Date().toISOString()
    });
    
    res.json({
        success: true,
        appeal: appeal,
        message: 'Appeal submitted successfully',
        realData: true
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        realData: true 
    });
});

// Internal endpoints for Discord bot to update data
app.post('/api/internal/update-guilds', (req, res) => {
    botData.guilds = req.body.guilds || [];
    botData.botStatus = 'online';
    console.log(`📊 Updated guilds: ${botData.guilds.length} guilds`);
    res.json({ success: true });
});

app.post('/api/internal/update-commands', (req, res) => {
    if (req.body.commands && Array.isArray(req.body.commands)) {
        botData.commands = req.body.commands;
        console.log(`📝 Updated commands: ${botData.commands.length} commands`);
    }
    res.json({ success: true });
});

app.post('/api/internal/add-log', (req, res) => {
    const log = {
        id: Date.now(),
        ...req.body,
        timestamp: new Date().toISOString()
    };
    botData.logs.unshift(log);
    if (botData.logs.length > 100) botData.logs = botData.logs.slice(0, 100);
    res.json({ success: true });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log('✅ Pi Bot API Server Started');
    console.log(`🌐 Local: http://localhost:${port}`);
    console.log(`🌐 Network: http://192.168.1.62:${port}`);
    console.log(`📊 Status: ${botData.botStatus}`);
    console.log(`📝 Commands: ${botData.commands.length}`);
    console.log('🔗 Ready for ngrok tunnel');
});
