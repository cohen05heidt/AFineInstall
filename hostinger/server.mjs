/* The Node entry point Hostinger runs.

   Serves the prerendered site out of dist/ and answers POST /api/quote.
   Secrets come from environment variables set in the Hostinger dashboard, so
   nothing sensitive is ever written to disk or committed to git. */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { sendQuoteEmails } from "./mail.mjs";

const PORT = Number(process.env.PORT) || 3000;
const ROOT = resolve(process.env.STATIC_ROOT || "./dist");
const env = process.env;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function headers(extra = {}) {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    ...extra,
  };
}

const json = (res, status, body) => {
  res.writeHead(status, headers({ "Content-Type": "application/json; charset=utf-8" }));
  res.end(JSON.stringify(body));
};

/* ---------- database ---------- */

let poolPromise = null;
async function db() {
  if (!env.DB_HOST || !env.DB_NAME || !env.DB_USER) return null;
  if (!poolPromise) {
    poolPromise = (async () => {
      const mysql = await import("mysql2/promise");
      const pool = mysql.createPool({
        host: env.DB_HOST,
        database: env.DB_NAME,
        user: env.DB_USER,
        password: env.DB_PASS || "",
        waitForConnections: true,
        connectionLimit: 4,
        charset: "utf8mb4",
      });
      await pool.query(`CREATE TABLE IF NOT EXISTS quote_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        phone VARCHAR(40) NOT NULL,
        email VARCHAR(160) NULL,
        town VARCHAR(120) NULL,
        service TEXT NOT NULL,
        message TEXT NULL,
        ip VARCHAR(45) NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      return pool;
    })().catch((err) => {
      console.error("database unavailable:", err.message);
      poolPromise = null;
      return null;
    });
  }
  return poolPromise;
}

/* ---------- the quote endpoint ---------- */

const clip = (v, max) => String(v ?? "").trim().slice(0, max);

async function handleQuote(req, res, body) {
  let input;
  try {
    input = JSON.parse(body);
  } catch {
    return json(res, 400, { ok: false, error: "json" });
  }
  if (!input || typeof input !== "object") {
    return json(res, 400, { ok: false, error: "json" });
  }

  const d = {
    name: clip(input.name, 120),
    phone: clip(input.phone, 40),
    email: clip(input.email, 160),
    town: clip(input.town, 120),
    message: clip(input.message, 2000),
    service: Array.isArray(input.service)
      ? input.service.map((s) => clip(s, 80)).filter(Boolean).slice(0, 12)
      : [],
  };

  if (d.name.length < 2) return json(res, 400, { ok: false, error: "name" });
  if (d.phone.replace(/\D/g, "").length < 7)
    return json(res, 400, { ok: false, error: "phone" });
  if (d.service.length === 0)
    return json(res, 400, { ok: false, error: "service" });
  if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) d.email = "";

  const ip = clip(
    (req.headers["x-forwarded-for"] || "").split(",")[0] ||
      req.socket.remoteAddress ||
      "",
    45,
  );

  /* save first, so a mail outage cannot lose an enquiry */
  let saved = false;
  const pool = await db();
  if (pool) {
    try {
      const [rows] = await pool.query(
        "SELECT COUNT(*) AS n FROM quote_requests WHERE ip = ? AND created_at > (NOW() - INTERVAL 10 MINUTE)",
        [ip],
      );
      if (Number(rows[0]?.n ?? 0) >= 5) {
        return json(res, 429, { ok: false, error: "slow_down" });
      }
      await pool.query(
        `INSERT INTO quote_requests (name, phone, email, town, service, message, ip)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          d.name, d.phone, d.email || null, d.town || null,
          d.service.join(", "), d.message || null, ip,
        ],
      );
      saved = true;
    } catch (err) {
      console.error("quote insert failed:", err.message);
    }
  }

  let mail = { configured: false, notified: false, confirmed: false };
  try {
    mail = await sendQuoteEmails(env, d);
  } catch (err) {
    console.error("quote mail failed:", err.message);
  }

  if (!saved && !mail.notified) {
    return json(res, 500, { ok: false, error: "storage" });
  }
  return json(res, 200, { ok: true, confirmed: mail.confirmed });
}

/* ---------- static files ---------- */

async function serveStatic(req, res, pathname) {
  /* normalize away any ../ before touching the filesystem */
  const rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(ROOT, rel);
  if (!file.startsWith(ROOT)) {
    res.writeHead(403, headers()).end("Forbidden");
    return;
  }
  const requestedExt = extname(rel).toLowerCase();
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, "index.html");
  } catch {
    /* A missing FILE is a 404. Only extensionless paths fall back to the page.
       Returning index.html with a 200 for a missing stylesheet would hide
       broken asset references and confuse the browser about what it received. */
    if (requestedExt) {
      res.writeHead(404, headers({ "Content-Type": "text/plain; charset=utf-8" }));
      res.end("Not found");
      return;
    }
    file = join(ROOT, "index.html");
  }

  try {
    const buf = await readFile(file);
    const ext = extname(file).toLowerCase();
    const immutable = rel.startsWith("/assets/") && ext !== ".html";
    res.writeHead(
      200,
      headers({
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": immutable
          ? "public, max-age=31536000, immutable"
          : "public, max-age=0, must-revalidate",
      }),
    );
    res.end(buf);
  } catch (err) {
    console.error("static read failed:", err.message);
    res.writeHead(404, headers({ "Content-Type": "text/plain" })).end("Not found");
  }
}

/* ---------- server ---------- */

createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/quote" || url.pathname === "/api/quote.php") {
    if (req.method !== "POST") return json(res, 405, { ok: false, error: "method" });
    let body = "";
    let tooBig = false;
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20000) {
        tooBig = true;
        req.destroy();
      }
    });
    req.on("end", () => {
      if (tooBig) return json(res, 413, { ok: false, error: "body" });
      handleQuote(req, res, body).catch((err) => {
        console.error("quote handler threw:", err);
        json(res, 500, { ok: false, error: "server" });
      });
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return json(res, 405, { ok: false, error: "method" });
  }
  serveStatic(req, res, url.pathname).catch((err) => {
    console.error("static handler threw:", err);
    res.writeHead(500, headers()).end("Server error");
  });
}).listen(PORT, () => {
  console.log(`A Fine Install listening on ${PORT}, serving ${ROOT}`);
  console.log(`database ${env.DB_HOST ? "configured" : "NOT configured"}`);
  console.log(
    `email ${env.RESEND_API_KEY ? "via resend" : env.GMAIL_CLIENT_ID ? "via gmail" : "NOT configured"}`,
  );
});
