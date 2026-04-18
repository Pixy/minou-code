# Louise — Minou Code

Jeu éducatif de programmation visuelle pour enfants (drag & drop de cartes → déplace un chat sur une grille).

## Lancer le serveur de développement

Utiliser un serveur **Node.js** (pas Python, pas `live-server`, pas autre chose) :

```bash
node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(process.cwd(), req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(8080, '0.0.0.0', () => {
  const ifaces = os.networkInterfaces();
  let ip = 'localhost';
  Object.values(ifaces).flat().forEach(i => { if (i.family === 'IPv4' && !i.internal) ip = i.address; });
  console.log('http://' + ip + ':8080  (iPad)');
  console.log('http://localhost:8080  (local)');
});
"
```

Port par défaut : **8080**. L'IP réseau locale est affichée au démarrage (pour accès iPad sur le même Wi-Fi).
