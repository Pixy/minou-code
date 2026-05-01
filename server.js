const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const PORT = 8080;

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;
  const filePath = path.join(process.cwd(), pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ifaces = os.networkInterfaces();
  let ip = 'localhost';
  Object.values(ifaces).flat().forEach((i) => {
    if (i.family === 'IPv4' && !i.internal) ip = i.address;
  });
  console.log(`http://${ip}:${PORT}  (iPad)`);
  console.log(`http://localhost:${PORT}  (local)`);
});
