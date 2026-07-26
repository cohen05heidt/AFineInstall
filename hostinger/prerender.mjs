import { readFileSync, writeFileSync } from "node:fs";

/* Render the page to real HTML at build time. Crawlers and anyone with
   JavaScript switched off get the whole page as markup, and the browser
   hydrates the same tree on top of it. */
const { render, origin, jsonLd } = await import("./dist-ssr/entry-server.js");

const html = render();
const out = readFileSync("dist/index.html", "utf8")
  .replace("<!--app-html-->", html)
  .replace("__JSONLD__", jsonLd())
  .replaceAll("__ORIGIN__", origin.replace(/\/$/, ""));

writeFileSync("dist/index.html", out);

/* robots.txt and sitemap.xml carry the origin too */
const clean = origin.replace(/\/$/, "");
writeFileSync(
  "dist/robots.txt",
  readFileSync("dist/robots.txt", "utf8").replaceAll("__ORIGIN__", clean),
);
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${clean}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>
</urlset>
`,
);

if (out.includes("__ORIGIN__") || out.includes("__JSONLD__")) {
  console.error("FAIL: a placeholder survived into the output");
  process.exit(1);
}
console.log(`prerendered ${html.length} chars of HTML, origin ${origin}`);
