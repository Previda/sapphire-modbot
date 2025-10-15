// Pi Bot Connection Manager - Auto-detect and connect to Pi bot
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // List of possible Pi bot URLs to try
    const possibleUrls = [
      process.env.PI_BOT_API_URL,
      'http://192.168.1.62:3001',
      'http://192.168.1.62:3004',
      'http://localhost:3001',
      'http://localhost:3004',
      // Add ngrok URLs from memory
      'https://49ab22ffae37.ngrok-free.app',
      'https://5ba6913ad59e.ngrok-free.app'
    ].filter(Boolean);

    console.log('Testing Pi bot connections:', possibleUrls);

    const connectionResults = await Promise.allSettled(
      possibleUrls.map(async (url) => {
        const startTime = Date.now();
        try {
          const response = await fetch(`${url}/api/status`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
              'User-Agent': 'Skyfall-Dashboard/1.0'
            },
            signal: AbortSignal.timeout(8000)
          });

          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            const data = await response.json();
            return {
              url,
              status: 'connected',
              responseTime,
              data,
              priority: url.includes('ngrok') ? 1 : url.includes('192.168') ? 2 : 3
            };
          } else {
            return {
              url,
              status: 'error',
              responseTime,
              httpStatus: response.status,
              priority: 999
            };
          }
        } catch (error) {
          return {
            url,
            status: 'failed',
            responseTime: Date.now() - startTime,
            error: error.message,
            priority: 999
          };
        }
      })
    );

    const results = connectionResults
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter(Boolean);

    // Find the best connection (lowest priority number = highest priority)
    const connectedResults = results.filter(r => r.status === 'connected');
    const bestConnection = connectedResults.sort((a, b) => a.priority - b.priority)[0];

    if (bestConnection) {
      // Test additional endpoints on the best connection
      const additionalTests = await Promise.allSettled([
        fetch(`${bestConnection.url}/api/guilds`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Skyfall-Dashboard/1.0'
          },
          signal: AbortSignal.timeout(5000)
        }),
        fetch(`${bestConnection.url}/api/commands/manage`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'Skyfall-Dashboard/1.0'
          },
          signal: AbortSignal.timeout(5000)
        })
      ]);

      const guildsTest = additionalTests[0];
      const commandsTest = additionalTests[1];

      let guildsData = null;
      let commandsData = null;

      if (guildsTest.status === 'fulfilled' && guildsTest.value.ok) {
        try {
          guildsData = await guildsTest.value.json();
        } catch (e) {}
      }

      if (commandsTest.status === 'fulfilled' && commandsTest.value.ok) {
        try {
          commandsData = await commandsTest.value.json();
        } catch (e) {}
      }

      return res.status(200).json({
        success: true,
        connected: true,
        bestConnection: {
          ...bestConnection,
          guildsCount: guildsData?.guilds?.length || bestConnection.data?.guilds || 0,
          commandsCount: commandsData?.commands?.length || 0,
          features: {
            guilds: !!guildsData,
            commands: !!commandsData,
            status: true
          }
        },
        allResults: results,
        testedUrls: possibleUrls.length,
        connectedUrls: connectedResults.length,
        recommendation: bestConnection.url.includes('ngrok') ? 
          'Using ngrok tunnel - excellent for external access' :
          'Using local network connection - good for development'
      });
    } else {
      return res.status(200).json({
        success: true,
        connected: false,
        message: 'No Pi bot connections available',
        allResults: results,
        testedUrls: possibleUrls.length,
        connectedUrls: 0,
        suggestions: [
          'Ensure Pi bot is running with PM2: pm2 status',
          'Check if Pi bot API server is accessible on port 3001 or 3004',
          'Verify ngrok tunnel is active and accessible',
          'Check firewall settings on Pi device',
          'Ensure Pi bot has proper network connectivity'
        ]
      });
    }

  } catch (error) {
    console.error('Pi bot connection test failed:', error);
    return res.status(500).json({
      success: false,
      connected: false,
      error: 'Connection test failed',
      message: error.message
    });
  }
}
