// Dependency-free static file server for the production build (dist/).
// Serves the SPA with history fallback so wouter routes resolve on refresh.
// Launch detached: Start-Process node.exe serve-dist.js -WindowStyle Hidden.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, "dist");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = path.join(ROOT, urlPath);
  // Prevent path traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      res.writeHead(200, { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    // SPA fallback -> index.html
    const idx = path.join(ROOT, "index.html");
    fs.stat(idx, (e2, s2) => {
      if (e2 || !s2.isFile()) { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("build missing — run npm run build"); return; }
      res.writeHead(200, { "Content-Type": MIME[".html"] });
      fs.createReadStream(idx).pipe(res);
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`nowhere-ai production build served at http://localhost:${PORT} (from ${ROOT})`);
});