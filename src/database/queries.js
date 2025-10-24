const { query } = require('./db');

// ===== MODERATION LOGS =====

async function logModeration(guildId, userId, moderatorId, action, reason, duration = null) {
  const expiresAt = duration ? new Date(Date.now() + duration) : null;
  
  const result = await query(
    `INSERT INTO moderation_logs (guild_id, user_id, moderator_id, action, reason, duration, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [guildId, userId, moderatorId, action, reason, duration, expiresAt]
  );
  
  return result.rows[0];
}

async function getModerationLogs(guildId, userId = null, limit = 50) {
  if (userId) {
    const result = await query(
      `SELECT * FROM moderation_logs 
       WHERE guild_id = $1 AND user_id = $2 
       ORDER BY created_at DESC 
       LIMIT $3`,
      [guildId, userId, limit]
    );
    return result.rows;
  } else {
    const result = await query(
      `SELECT * FROM moderation_logs 
       WHERE guild_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [guildId, limit]
    );
    return result.rows;
  }
}

async function getActivePunishments(guildId, userId) {
  const result = await query(
    `SELECT * FROM moderation_logs 
     WHERE guild_id = $1 AND user_id = $2 AND active = true
     AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY created_at DESC`,
    [guildId, userId]
  );
  return result.rows;
}

async function deactivatePunishment(id) {
  await query(
    `UPDATE moderation_logs SET active = false WHERE id = $1`,
    [id]
  );
}

// ===== USER WARNINGS =====

async function addWarning(guildId, userId, moderatorId, reason) {
  const result = await query(
    `INSERT INTO user_warnings (guild_id, user_id, moderator_id, reason)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [guildId, userId, moderatorId, reason]
  );
  
  return result.rows[0];
}

async function getWarnings(guildId, userId) {
  const result = await query(
    `SELECT * FROM user_warnings 
     WHERE guild_id = $1 AND user_id = $2 
     ORDER BY created_at DESC`,
    [guildId, userId]
  );
  return result.rows;
}

async function getWarningCount(guildId, userId) {
  const result = await query(
    `SELECT COUNT(*) as count FROM user_warnings 
     WHERE guild_id = $1 AND user_id = $2`,
    [guildId, userId]
  );
  return parseInt(result.rows[0].count);
}

async function clearWarnings(guildId, userId) {
  await query(
    `DELETE FROM user_warnings WHERE guild_id = $1 AND user_id = $2`,
    [guildId, userId]
  );
}

// ===== SERVER SETTINGS =====

async function getServerSettings(guildId) {
  const result = await query(
    `SELECT * FROM server_settings WHERE guild_id = $1`,
    [guildId]
  );
  
  if (result.rows.length === 0) {
    // Create default settings
    const newSettings = await query(
      `INSERT INTO server_settings (guild_id) VALUES ($1) RETURNING *`,
      [guildId]
    );
    return newSettings.rows[0];
  }
  
  return result.rows[0];
}

async function updateServerSettings(guildId, settings) {
  const result = await query(
    `UPDATE server_settings 
     SET prefix = COALESCE($2, prefix),
         mod_log_channel = COALESCE($3, mod_log_channel),
         welcome_channel = COALESCE($4, welcome_channel),
         auto_mod_enabled = COALESCE($5, auto_mod_enabled),
         settings = COALESCE($6, settings),
         updated_at = CURRENT_TIMESTAMP
     WHERE guild_id = $1
     RETURNING *`,
    [
      guildId,
      settings.prefix,
      settings.mod_log_channel,
      settings.welcome_channel,
      settings.auto_mod_enabled,
      settings.settings ? JSON.stringify(settings.settings) : null
    ]
  );
  
  return result.rows[0];
}

// ===== APPEAL SUBMISSIONS =====

async function createAppeal(guildId, userId, banReason, appealReason) {
  const result = await query(
    `INSERT INTO appeal_submissions (guild_id, user_id, ban_reason, appeal_reason)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [guildId, userId, banReason, appealReason]
  );
  
  return result.rows[0];
}

async function getAppeals(guildId, status = null) {
  if (status) {
    const result = await query(
      `SELECT * FROM appeal_submissions 
       WHERE guild_id = $1 AND status = $2 
       ORDER BY created_at DESC`,
      [guildId, status]
    );
    return result.rows;
  } else {
    const result = await query(
      `SELECT * FROM appeal_submissions 
       WHERE guild_id = $1 
       ORDER BY created_at DESC`,
      [guildId]
    );
    return result.rows;
  }
}

async function updateAppealStatus(appealId, status, reviewedBy) {
  await query(
    `UPDATE appeal_submissions 
     SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP 
     WHERE id = $3`,
    [status, reviewedBy, appealId]
  );
}

// ===== COMMAND STATS =====

async function logCommandUsage(guildId, userId, commandName, success = true) {
  await query(
    `INSERT INTO command_stats (guild_id, user_id, command_name, success)
     VALUES ($1, $2, $3, $4)`,
    [guildId, userId, commandName, success]
  );
}

async function getCommandStats(guildId, limit = 10) {
  const result = await query(
    `SELECT command_name, COUNT(*) as usage_count, 
            SUM(CASE WHEN success THEN 1 ELSE 0 END) as success_count
     FROM command_stats 
     WHERE guild_id = $1 
     GROUP BY command_name 
     ORDER BY usage_count DESC 
     LIMIT $2`,
    [guildId, limit]
  );
  return result.rows;
}

async function getTotalCommandUsage(guildId) {
  const result = await query(
    `SELECT COUNT(*) as total FROM command_stats WHERE guild_id = $1`,
    [guildId]
  );
  return parseInt(result.rows[0].total);
}

// ===== ANALYTICS =====

async function getServerAnalytics(guildId) {
  const [moderationCount, warningCount, appealCount, commandCount] = await Promise.all([
    query(`SELECT COUNT(*) as count FROM moderation_logs WHERE guild_id = $1`, [guildId]),
    query(`SELECT COUNT(*) as count FROM user_warnings WHERE guild_id = $1`, [guildId]),
    query(`SELECT COUNT(*) as count FROM appeal_submissions WHERE guild_id = $1`, [guildId]),
    query(`SELECT COUNT(*) as count FROM command_stats WHERE guild_id = $1`, [guildId])
  ]);
  
  return {
    totalModerationActions: parseInt(moderationCount.rows[0].count),
    totalWarnings: parseInt(warningCount.rows[0].count),
    totalAppeals: parseInt(appealCount.rows[0].count),
    totalCommands: parseInt(commandCount.rows[0].count)
  };
}

module.exports = {
  // Moderation
  logModeration,
  getModerationLogs,
  getActivePunishments,
  deactivatePunishment,
  
  // Warnings
  addWarning,
  getWarnings,
  getWarningCount,
  clearWarnings,
  
  // Settings
  getServerSettings,
  updateServerSettings,
  
  // Appeals
  createAppeal,
  getAppeals,
  updateAppealStatus,
  
  // Stats
  logCommandUsage,
  getCommandStats,
  getTotalCommandUsage,
  getServerAnalytics
};
