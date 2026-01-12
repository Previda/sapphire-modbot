// Live Operational Status API - Real-time system monitoring
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const PI_BOT_URL = process.env.PI_BOT_API_URL || 'http://192.168.1.62:3001';
    const startTime = Date.now();
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const dashboardBaseUrl = `${protocol}://${host}`;

    // Test Pi bot connection
    let piBotStatus = {
      status: 'offline',
      responseTime: null,
      lastCheck: new Date().toISOString(),
      error: null
    };

    try {
      const piBotResponse = await fetch(`${PI_BOT_URL}/api/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'User-Agent': 'Skyfall-Status-Monitor/1.0'
        },
        signal: AbortSignal.timeout(5000)
      });

      const responseTime = Date.now() - startTime;

      if (piBotResponse.ok) {
        const data = await piBotResponse.json();
        piBotStatus = {
          status: 'online',
          responseTime: responseTime,
          lastCheck: new Date().toISOString(),
          uptime: data.uptime || 0,
          version: data.version || '1.0.0',
          guilds: data.guilds || 0,
          users: data.users || 0,
          error: null
        };
      } else {
        piBotStatus.status = 'degraded';
        piBotStatus.responseTime = responseTime;
        piBotStatus.error = `HTTP ${piBotResponse.status}`;
      }
    } catch (error) {
      piBotStatus.error = error.message;
      piBotStatus.responseTime = Date.now() - startTime;
    }

    // Test command endpoints
    const commandEndpoints = [
      { name: 'Commands API', endpoint: '/api/commands/manage' },
      { name: 'Discord Data', endpoint: '/api/guilds' },
      { name: 'User Profile', endpoint: '/api/user/profile' },
      { name: 'Appeals', endpoint: '/api/appeals' },
      { name: 'Logs', endpoint: '/api/logs' }
    ];

    const endpointStatus = await Promise.all(
      commandEndpoints.map(async (endpoint) => {
        const testStart = Date.now();
        try {
          const baseUrl = endpoint.endpoint === '/api/user/profile'
            ? dashboardBaseUrl
            : PI_BOT_URL;

          const response = await fetch(`${baseUrl}${endpoint.endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
              'User-Agent': 'Skyfall-Status-Monitor/1.0'
            },
            signal: AbortSignal.timeout(3000)
          });

          const isUserProfile = endpoint.endpoint === '/api/user/profile';
          const ok = response.ok || (isUserProfile && response.status === 401);

          return {
            name: endpoint.name,
            endpoint: endpoint.endpoint,
            status: ok ? 'operational' : 'degraded',
            responseTime: Date.now() - testStart,
            lastCheck: new Date().toISOString(),
            error: ok ? null : `HTTP ${response.status}`
          };
        } catch (error) {
          return {
            name: endpoint.name,
            endpoint: endpoint.endpoint,
            status: 'offline',
            responseTime: Date.now() - testStart,
            lastCheck: new Date().toISOString(),
            error: error.message
          };
        }
      })
    );

    // Calculate overall system health
    const totalEndpoints = endpointStatus.length + 1; // +1 for Pi bot
    const operationalCount = endpointStatus.filter(e => e.status === 'operational').length + 
                           (piBotStatus.status === 'online' ? 1 : 0);
    const healthPercentage = Math.round((operationalCount / totalEndpoints) * 100);

    let overallStatus = 'operational';
    if (healthPercentage < 50) overallStatus = 'major_outage';
    else if (healthPercentage < 80) overallStatus = 'partial_outage';
    else if (healthPercentage < 100) overallStatus = 'degraded_performance';

    // Generate uptime data (simulated for demo)
    const uptimeData = {
      last24Hours: 99.8,
      last7Days: 99.9,
      last30Days: 99.95,
      last90Days: 99.92
    };

    // Recent incidents (simulated)
    const recentIncidents = [
      {
        id: 1,
        title: 'Ngrok tunnel reconnection',
        status: 'resolved',
        impact: 'minor',
        startTime: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        resolvedTime: new Date(Date.now() - 1200000).toISOString(), // 20 min ago
        description: 'Ngrok tunnel was automatically reconnected with new URL'
      }
    ];

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      overall: {
        status: overallStatus,
        healthPercentage: healthPercentage,
        message: getStatusMessage(overallStatus)
      },
      services: {
        piBot: piBotStatus,
        endpoints: endpointStatus
      },
      uptime: uptimeData,
      incidents: recentIncidents,
      metrics: {
        totalServices: totalEndpoints,
        operationalServices: operationalCount,
        averageResponseTime: Math.round(
          (piBotStatus.responseTime + endpointStatus.reduce((sum, e) => sum + e.responseTime, 0)) / 
          totalEndpoints
        )
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Status check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

function getStatusMessage(status) {
  switch (status) {
    case 'operational': return 'All systems operational';
    case 'degraded_performance': return 'Some systems experiencing issues';
    case 'partial_outage': return 'Partial system outage';
    case 'major_outage': return 'Major system outage';
    default: return 'Status unknown';
  }
}
