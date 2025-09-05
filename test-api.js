const https = require('https');

const url = 'https://skyfall-omega.vercel.app/api/bot/live/1340417327518191697';

https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
