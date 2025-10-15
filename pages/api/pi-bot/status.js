// Pi Bot Status and Connection API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001';
    
    // Test Pi bot connection with multiple endpoints
    const testEndpoints = [
      '/api/status',
      '/api/guilds',
      '/api/commands/manage',
      '/api/logs',
      '/api/appeals'
    ];

    const results = await Promise.allSettled(
      testEndpoints.map(async (endpoint) => {
        const startTime = Date.now();
        try {
          const response = await fetch(`${PI_BOT_URL}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Skyfall-Dashboard/1.0'
            },
            signal: AbortSignal.timeout(5000)
          });

          const responseTime = Date.now() - startTime;
          const isOk = response.ok;
          let data = null;
          
          if (isOk) {
            try {
              data = await response.json();
            } catch (e) {
              // Response might not be JSON
            }
          }

          return {
            endpoint,
            status: isOk ? 'online' : 'error',
            responseTime,
            httpStatus: response.status,
            data: data
          };
        } catch (error) {
          return {
            endpoint,
            status: 'offline',
            responseTime: Date.now() - startTime,
            error: error.message
          };
        }
      })
    );

    const endpointResults = results.map(result => 
      result.status === 'fulfilled' ? result.value : {
        endpoint: 'unknown',
        status: 'error',
        error: result.reason?.message || 'Unknown error'
      }
    );

    // Calculate overall health
    const onlineCount = endpointResults.filter(r => r.status === 'online').length;
    const totalCount = endpointResults.length;
    const healthPercentage = Math.round((onlineCount / totalCount) * 100);

    let overallStatus = 'offline';
    if (healthPercentage >= 80) overallStatus = 'online';
    else if (healthPercentage >= 50) overallStatus = 'degraded';

    // Get bot data from status endpoint if available
    const statusResult = endpointResults.find(r => r.endpoint === '/api/status');
    const guildsResult = endpointResults.find(r => r.endpoint === '/api/guilds');

    return res.status(200).json({
      success: true,
      overall: {
        status: overallStatus,
        healthPercentage,
        timestamp: new Date().toISOString()
      },
      piBot: {
        url: PI_BOT_URL,
        status: statusResult?.status || 'unknown',
        responseTime: statusResult?.responseTime || null,
        uptime: statusResult?.data?.uptime || null,
        version: statusResult?.data?.version || '1.0.0',
        guilds: statusResult?.data?.guilds || guildsResult?.data?.guilds?.length || 0,
        users: statusResult?.data?.users || 0
      },
      endpoints: endpointResults,
      connectionTest: {
        totalEndpoints: totalCount,
        onlineEndpoints: onlineCount,
        offlineEndpoints: totalCount - onlineCount
      }
    });

  } catch (error) {
    console.error('Pi bot status check failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check Pi bot status',
      message: error.message,
      overall: {
        status: 'offline',
        healthPercentage: 0,
        timestamp: new Date().toISOString()
      }
    });
  }
}
