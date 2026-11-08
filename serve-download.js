import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8000;
const DOWNLOAD_DIR = path.join(__dirname, 'download');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.apk': 'application/vnd.android.package-archive',
};

const server = http.createServer((req, res) => {
  const cleanUrl = req.url.split('?')[0];
  let reqPath = cleanUrl;
  if (reqPath === '/' || reqPath === '/download' || reqPath === '/download/') {
    reqPath = 'index.html';
  } else if (reqPath.startsWith('/download/')) {
    reqPath = reqPath.replace('/download/', '');
  }

  let filePath = path.join(DOWNLOAD_DIR, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DOWNLOAD_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileSize = fs.statSync(filePath).size;

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': fileSize,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(ext === '.apk' ? { 'Content-Disposition': 'attachment; filename="TheThreeThings.apk"' } : {}),
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
