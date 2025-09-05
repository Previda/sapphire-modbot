import { getDocument, setDocument } from '../../../src/utils/database';

export default async function handler(req, res) {
  const { serverId } = req.query;

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' });
  }

  if (req.method === 'GET') {
    try {
      const config = await getDocument('verification', serverId);
      const logs = await getDocument('verification_logs', serverId) || { entries: [] };
      const attempts = await getDocument('verification_attempts', serverId) || { entries: [] };

      // Calculate stats
      const stats = {
        totalVerifications: logs.entries.filter(e => e.success === true).length,
        pendingVerifications: logs.entries.filter(e => e.success === null).length,
        failedAttempts: attempts.entries.filter(e => !e.success).length,
        verificationRate: 0,
        averageVerificationTime: 0
      };

      if (logs.entries.length > 0) {
        const successful = logs.entries.filter(e => e.success === true);
        stats.verificationRate = Math.round((successful.length / logs.entries.length) * 100);
      }

      res.status(200).json({
        config: config || null,
        stats,
        recentLogs: logs.entries.slice(0, 20),
        recentAttempts: attempts.entries.slice(0, 10)
      });

    } catch (error) {
      console.error('Verification API error:', error);
      res.status(500).json({ error: 'Failed to fetch verification data' });
    }

  } else if (req.method === 'POST') {
    try {
      const { action, settings } = req.body;

      if (action === 'update_settings') {
        const config = await getDocument('verification', serverId);
        if (!config) {
          return res.status(404).json({ error: 'Verification not configured' });
        }

        const updatedConfig = {
          ...config,
          ...settings,
          updatedAt: Date.now()
        };

        await setDocument('verification', serverId, updatedConfig);
        
        res.status(200).json({ 
          success: true, 
          message: 'Settings updated',
          config: updatedConfig 
        });

      } else if (action === 'toggle_enabled') {
        const config = await getDocument('verification', serverId);
        if (!config) {
          return res.status(404).json({ error: 'Verification not configured' });
        }

        const updatedConfig = {
          ...config,
          enabled: !config.enabled,
          updatedAt: Date.now()
        };

        await setDocument('verification', serverId, updatedConfig);
        
        res.status(200).json({ 
          success: true, 
          message: `Verification ${updatedConfig.enabled ? 'enabled' : 'disabled'}`,
          config: updatedConfig 
        });

      } else if (action === 'clear_logs') {
        await setDocument('verification_logs', serverId, { entries: [] });
        await setDocument('verification_attempts', serverId, { entries: [] });
        
        res.status(200).json({ 
          success: true, 
          message: 'Logs cleared' 
        });

      } else {
        res.status(400).json({ error: 'Invalid action' });
      }

    } catch (error) {
      console.error('Verification API POST error:', error);
      res.status(500).json({ error: 'Failed to update verification settings' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
