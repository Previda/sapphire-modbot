const { Pool } = require('pg');

class Database {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }

    async query(text, params) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }

    async initializeTables() {
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
            console.error('❌ Database initialization failed:', error);
        }
    }

    // Guild settings methods
    async getGuildSettings(guildId) {
        const result = await this.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
        return result.rows[0] || null;
    }

    async updateGuildSettings(guildId, settings) {
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
    }

    // Music methods
    async getMusicState(guildId) {
        const result = await this.query('SELECT * FROM music_state WHERE guild_id = $1', [guildId]);
        return result.rows[0] || null;
    }

    async updateMusicState(guildId, state) {
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
    }

    async getQueue(guildId) {
        const result = await this.query(
            'SELECT * FROM music_queue WHERE guild_id = $1 ORDER BY position ASC',
            [guildId]
        );
        return result.rows;
    }

    async addToQueue(guildId, track, position) {
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
    }

    async clearQueue(guildId) {
        await this.query('DELETE FROM music_queue WHERE guild_id = $1', [guildId]);
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = new Database();
