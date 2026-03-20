const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4173;
const ROOT = __dirname;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function safeResolve(requestPath) {
  const cleanPath = requestPath === '/' ? '/index.html' : requestPath;
  const resolved = path.normalize(path.join(ROOT, decodeURIComponent(cleanPath)));
  if (!resolved.startsWith(ROOT)) {
    return null;
  }
  return resolved;
}

const server = http.createServer((req, res) => {
  const target = safeResolve(req.url || '/');
  if (!target) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.readFile(target, (error, data) => {
    if (error) {
      res.statusCode = error.code === 'ENOENT' ? 404 : 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', MIME_TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream');
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`StreakGarden server running at http://127.0.0.1:${PORT}/`);
});
