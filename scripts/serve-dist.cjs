#!/usr/bin/env node
/**
 * Servidor estático mínimo para o build web (dist/), usado pelos testes E2E.
 *
 * Existe para não adicionar dependência só para servir arquivo. Faz fallback
 * para index.html nas rotas do expo-router (client-side routing).
 *
 * Uso: node scripts/serve-dist.cjs [porta]
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "dist");
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
};

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

http
  .createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    let file = path.join(ROOT, url);

    // Diretório → index.html dele; rota sem extensão → tenta <rota>.html
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      file = path.join(file, "index.html");
    } else if (!path.extname(file)) {
      const asHtml = `${file}.html`;
      file = fs.existsSync(asHtml) ? asHtml : path.join(ROOT, "index.html");
    }

    // Nunca servir fora de dist/
    if (!file.startsWith(ROOT)) return send(res, 403, "forbidden", "text/plain");

    if (!fs.existsSync(file)) {
      // Fallback do roteamento client-side
      file = path.join(ROOT, "index.html");
      if (!fs.existsSync(file)) return send(res, 404, "not found", "text/plain");
    }

    send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || "application/octet-stream");
  })
  .listen(PORT, () => console.log(`dist/ em http://localhost:${PORT}`));
