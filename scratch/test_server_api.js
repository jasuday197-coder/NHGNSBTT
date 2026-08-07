const http = require('http');

const req = http.get('http://localhost:3000/api/audio-database', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Audio database record count:', Array.isArray(json) ? json.length : 'Not array');
      if (Array.isArray(json) && json.length > 0) {
        console.log('Sample record:', json[0].title, json[0].province, json[0].audioUrl);
      }
    } catch (e) {
      console.error('Failed to parse response JSON:', e);
    }
  });
});

req.on('error', (err) => {
  console.log('Server not currently running or connection refused (expected if server process is offline):', err.message);
});
