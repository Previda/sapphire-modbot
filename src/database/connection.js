const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class Database {
    constructor() {
        this.usePostgres = false;
        this.pool = null;
        this.jsonStoragePath = path.join(process.cwd(), 'data', 'database.json');
        
        // Try to initialize PostgreSQL connection if DATABASE_URL is provided
        if (process.env.DATABASE_URL) {
            try {
                this.pool = new Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
                this.usePostgres = true;
            } catch (error) {
                console.log('⚠️ PostgreSQL unavailable, falling back to JSON storage');
                this.usePostgres = false;
            }
        } else {
            console.log('📁 Using JSON storage (no DATABASE_URL provided)');
        }
    }

    async query(text, params) {
        if (!this.usePostgres) {
            console.log('⚠️ Database query attempted but PostgreSQL not available');
            return { rows: [] };
        }
        
        try {
            const client = await this.pool.connect();
            try {
                const result = await client.query(text, params);
                return result;
            } finally {
                client.release();
            }
        } catch (error) {
            console.log('⚠️ PostgreSQL query failed, falling back to JSON storage');
            this.usePostgres = false;
            return { rows: [] };
        }
    }

    async initializeTables() {
        if (!this.usePostgres) {
            console.log('📁 Initializing JSON storage...');
            await this.ensureJsonStorage();
            console.log('✅ JSON storage initialized successfully');
            return;
        }

        try {
            // Guild settings table
            await this.query(`
                CREATE TABLE IF NOT EXISTS guild_settings (
                    guild_id VARCHAR(20) PRIMARY KEY,
                    music_enabled BOOLEAN DEFAULT false,
                    music_role VARCHAR(20),
                    tickets_enabled BOOLEAN DEFAULT false,
                    ticket_category VARCHAR(20),
                    ticket_staff_role VARCHAR(20),
                    automod_enabled BOOLEAN DEFAULT true,
                    welcome_enabled BOOLEAN DEFAULT false,
                    welcome_channel VARCHAR(20),
                    welcome_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Music queue table
            await this.query(`
                CREATE TABLE IF NOT EXISTS music_queue (
                    id SERIAL PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    track_title VARCHAR(500),
                    track_url VARCHAR(1000),
                    track_author VARCHAR(200),
                    track_duration INTEGER,
                    track_thumbnail VARCHAR(1000),
                    requester_id VARCHAR(20),
                    requester_name VARCHAR(100),
                    position INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Music state table
            await this.query(`
                CREATE TABLE IF NOT EXISTS music_state (
                    guild_id VARCHAR(20) PRIMARY KEY,
                    current_track JSONB,
                    loop_mode VARCHAR(10) DEFAULT 'off',
                    volume INTEGER DEFAULT 50,
                    is_playing BOOLEAN DEFAULT false,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Tickets table
            await this.query(`
                CREATE TABLE IF NOT EXISTS tickets (
                    id SERIAL PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    channel_id VARCHAR(20) UNIQUE,
                    user_id VARCHAR(20) NOT NULL,
                    category VARCHAR(50),
                    status VARCHAR(20) DEFAULT 'open',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    closed_at TIMESTAMP
                )
            `);

            // User warnings table
            await this.query(`
                CREATE TABLE IF NOT EXISTS user_warnings (
                    id SERIAL PRIMARY KEY,
                    guild_id VARCHAR(20) NOT NULL,
                    user_id VARCHAR(20) NOT NULL,
                    moderator_id VARCHAR(20),
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('✅ Database tables initialized successfully');
        } catch (error) {
            console.log('⚠️ PostgreSQL initialization failed, falling back to JSON storage');
            this.usePostgres = false;
            await this.ensureJsonStorage();
            console.log('✅ JSON storage initialized successfully');
        }
    }

    async ensureJsonStorage() {
        try {
            const dataDir = path.dirname(this.jsonStoragePath);
            await fs.mkdir(dataDir, { recursive: true });
            
            // Check if JSON file exists
            try {
                await fs.access(this.jsonStoragePath);
            } catch {
                // Create initial JSON structure
                const initialData = {
                    guild_settings: {},
                    music_state: {},
                    music_queue: {},
                    tickets: {},
                    user_warnings: {}
                };
                await fs.writeFile(this.jsonStoragePath, JSON.stringify(initialData, null, 2));
            }
        } catch (error) {
            console.error('Failed to initialize JSON storage:', error);
        }
    }

    async readJsonData() {
        try {
            const data = await fs.readFile(this.jsonStoragePath, 'utf8');
            return JSON.parse(data);
        } catch {
            return {
                guild_settings: {},
                music_state: {},
                music_queue: {},
                tickets: {},
                user_warnings: {}
            };
        }
    }

    async writeJsonData(data) {
        try {
            await fs.writeFile(this.jsonStoragePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to write JSON data:', error);
        }
    }

    // Guild settings methods
    async getGuildSettings(guildId) {
        if (this.usePostgres) {
            const result = await this.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
            return result.rows[0] || null;
        } else {
            const data = await this.readJsonData();
            return data.guild_settings[guildId] || null;
        }
    }

    async updateGuildSettings(guildId, settings) {
        if (this.usePostgres) {
            const query = `
                INSERT INTO guild_settings (guild_id, music_enabled, music_role, tickets_enabled, ticket_category, ticket_staff_role, automod_enabled, welcome_enabled, welcome_channel, welcome_message, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
                ON CONFLICT (guild_id) DO UPDATE SET
                    music_enabled = EXCLUDED.music_enabled,
                    music_role = EXCLUDED.music_role,
                    tickets_enabled = EXCLUDED.tickets_enabled,
                    ticket_category = EXCLUDED.ticket_category,
                    ticket_staff_role = EXCLUDED.ticket_staff_role,
                    automod_enabled = EXCLUDED.automod_enabled,
                    welcome_enabled = EXCLUDED.welcome_enabled,
                    welcome_channel = EXCLUDED.welcome_channel,
                    welcome_message = EXCLUDED.welcome_message,
                    updated_at = CURRENT_TIMESTAMP
            `;
            
            await this.query(query, [
                guildId,
                settings.musicEnabled || false,
                settings.musicRole || null,
                settings.ticketsEnabled || false,
                settings.ticketCategory || null,
                settings.ticketStaffRole || null,
                settings.automodEnabled || true,
                settings.welcomeEnabled || false,
                settings.welcomeChannel || null,
                settings.welcomeMessage || null
            ]);
        } else {
            const data = await this.readJsonData();
            data.guild_settings[guildId] = {
                guild_id: guildId,
                music_enabled: settings.musicEnabled || false,
                music_role: settings.musicRole || null,
                tickets_enabled: settings.ticketsEnabled || false,
                ticket_category: settings.ticketCategory || null,
                ticket_staff_role: settings.ticketStaffRole || null,
                automod_enabled: settings.automodEnabled || true,
                welcome_enabled: settings.welcomeEnabled || false,
                welcome_channel: settings.welcomeChannel || null,
                welcome_message: settings.welcomeMessage || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            await this.writeJsonData(data);
        }
    }

    // Music methods
    async getMusicState(guildId) {
        if (this.usePostgres) {
            const result = await this.query('SELECT * FROM music_state WHERE guild_id = $1', [guildId]);
            return result.rows[0] || null;
        } else {
            const data = await this.readJsonData();
            return data.music_state[guildId] || null;
        }
    }

    async updateMusicState(guildId, state) {
        if (this.usePostgres) {
            const query = `
                INSERT INTO music_state (guild_id, current_track, loop_mode, volume, is_playing, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                ON CONFLICT (guild_id) DO UPDATE SET
                    current_track = EXCLUDED.current_track,
                    loop_mode = EXCLUDED.loop_mode,
                    volume = EXCLUDED.volume,
                    is_playing = EXCLUDED.is_playing,
                    updated_at = CURRENT_TIMESTAMP
            `;
            
            await this.query(query, [
                guildId,
                JSON.stringify(state.currentTrack),
                state.loopMode || 'off',
                state.volume || 50,
                state.isPlaying || false
            ]);
        } else {
            const data = await this.readJsonData();
            data.music_state[guildId] = {
                guild_id: guildId,
                current_track: state.currentTrack,
                loop_mode: state.loopMode || 'off',
                volume: state.volume || 50,
                is_playing: state.isPlaying || false,
                updated_at: new Date().toISOString()
            };
            await this.writeJsonData(data);
        }
    }

    async getQueue(guildId) {
        if (this.usePostgres) {
            const result = await this.query(
                'SELECT * FROM music_queue WHERE guild_id = $1 ORDER BY position ASC',
                [guildId]
            );
            return result.rows;
        } else {
            const data = await this.readJsonData();
            const guildQueue = data.music_queue[guildId] || [];
            return guildQueue.sort((a, b) => a.position - b.position);
        }
    }

    async addToQueue(guildId, track, position) {
        if (this.usePostgres) {
            await this.query(`
                INSERT INTO music_queue (guild_id, track_title, track_url, track_author, track_duration, track_thumbnail, requester_id, requester_name, position)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                guildId,
                track.title,
                track.url,
                track.author,
                track.duration,
                track.thumbnail,
                track.requesterId,
                track.requesterName,
                position
            ]);
        } else {
            const data = await this.readJsonData();
            if (!data.music_queue[guildId]) {
                data.music_queue[guildId] = [];
            }
            data.music_queue[guildId].push({
                id: Date.now(),
                guild_id: guildId,
                track_title: track.title,
                track_url: track.url,
                track_author: track.author,
                track_duration: track.duration,
                track_thumbnail: track.thumbnail,
                requester_id: track.requesterId,
                requester_name: track.requesterName,
                position: position,
                created_at: new Date().toISOString()
            });
            await this.writeJsonData(data);
        }
    }

    async clearQueue(guildId) {
        if (this.usePostgres) {
            await this.query('DELETE FROM music_queue WHERE guild_id = $1', [guildId]);
        } else {
            const data = await this.readJsonData();
            data.music_queue[guildId] = [];
            await this.writeJsonData(data);
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
        }
    }
}

module.exports = new Database();
