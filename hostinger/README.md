# A Fine Install: the Hostinger build

The same website, rebuilt to run on ordinary hosting instead of a Cloudflare
Worker. Nothing about the design changed. What changed is the plumbing
underneath it.

## What is different from `../app`

| | `../app` (Cloudflare) | `hostinger/` (this) |
|---|---|---|
| Framework | TanStack Start, server rendered per request | Vite + React, prerendered once at build |
| Runtime | Cloudflare Worker | none, plain static files |
| Database | Cloudflare D1 | MySQL |
| Form handler | TanStack server function | `api/quote.php` |
| Email | Worker fetch to the Gmail API | `api/gmail.php`, same Gmail API |
| Needs Node on the server | yes | **no** |

The page is prerendered to real HTML at build time, so crawlers and anyone with
JavaScript off get the whole page as markup, and React hydrates on top of it.

## Build

```bash
npm install
npm run build
```

That produces `dist/`, which is the entire website: `index.html`, hashed
`assets/`, the images, `robots.txt`, `sitemap.xml`, `.htaccess` and `api/`.

The contents of `dist/` go into `public_html` on Hostinger.

## The domain

`src/lib/site.ts` has an `origin` field, already set to
`https://afineinstall.com`. It feeds the canonical URL, the Open Graph tags,
`robots.txt` and `sitemap.xml`. If the domain ever changes, change it there and
rebuild rather than editing the output by hand.

`.htaccess` forces HTTPS and redirects `www.afineinstall.com` to the bare
domain, so Google sees one site rather than four variants.

## Secrets

`api/config.php` holds the database credentials and the Gmail keys. It is
**not** in this repository, on purpose. Copy `api/config.example.php` to
`api/config.php` on the server and fill it in there.

`.htaccess` denies HTTP access to both files as a second line of defence.

## What the form does

1. Validates the input, rejecting short names, unusable phone numbers and empty
   service lists
2. Writes the request to MySQL, creating the table on first use
3. Throttles to five submissions per IP address per ten minutes
4. Emails the lead to the shop with reply-to set to the customer
5. Emails a confirmation to the customer, if they gave an address
6. Returns `{"ok":true,"confirmed":true|false}`

Saving happens before emailing. If Google is unreachable the enquiry is still on
record and the customer still sees a success screen.

## Testing status

Verified in a sandbox:

- PHP syntax on every file
- The endpoint over real HTTP: method rejection, malformed JSON, short name,
  bad phone, empty and non-array service lists, UTF-8 names, HTML injection
  attempts, and invalid emails being dropped
- No fatal errors on any of those paths, and JSON returned every time
- base64url encoding, HTML escaping and RFC 2047 subject encoding as unit tests
- The built site serving over HTTP: 151 KB of prerendered HTML, all ten gallery
  images, the OG card, robots.txt and sitemap.xml

**Not** verified, because the tools were not available in the sandbox:

- The actual MySQL `CREATE TABLE` and `INSERT`. The SQL is standard MySQL 5.7
  and 8 syntax and was reviewed by hand, but it has not been executed.
- The live Gmail API calls, which need real credentials.

Both need one real submission on the server to confirm.

## No mbstring assumption

`api/compat.php` provides UTF-8 safe string helpers that fall back to PCRE when
the `mbstring` extension is missing. A missing extension is a hard fatal in PHP,
which means a blank 500 and no JSON for the browser. This was a real bug caught
in testing, not a hypothetical.
