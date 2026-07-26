/* Transactional email for quote requests.

   Two transports, and the first one configured wins:

     RESEND  the default. One API key, and the from address lives at
             afineinstall.com, which Resend verifies with DNS records. Simple
             and reliable, and this is what the site is set up to use.
     GMAIL   sends as the Gmail account itself over the Gmail API. Needs three
             OAuth values and a published Google Cloud app. Kept as a fallback
             because it needs no domain at all.

   Neither configured means mail is skipped. The request is already saved by the
   time this runs, so nothing is lost either way. */

const esc = (v) =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/* headers must be ASCII, so anything else is RFC 2047 encoded */
const header = (v) =>
  /^[\x20-\x7E]*$/.test(v)
    ? v
    : `=?UTF-8?B?${Buffer.from(v, "utf8").toString("base64")}?=`;

const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
const b64url = (s) => Buffer.from(s, "utf8").toString("base64url");

const INK = "#0c1e19";
const RED = "#d23b2c";
const MUTED = "#5c6b63";

function shell(heading, inner) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f2f1ec;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f1ec;padding:28px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e0d8;">
  <tr><td style="height:5px;background:${RED};"></td></tr>
  <tr><td style="padding:30px 30px 8px 30px;font-family:Helvetica,Arial,sans-serif;">
    <div style="font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${MUTED};">A Fine Install</div>
    <h1 style="margin:14px 0 0 0;font-size:23px;line-height:1.25;color:${INK};font-weight:700;">${heading}</h1>
  </td></tr>
  <tr><td style="padding:14px 30px 30px 30px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3b463f;">${inner}</td></tr>
  <tr><td style="padding:18px 30px;border-top:1px solid #e2e0d8;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
    A Fine Install &middot; Gainesville, Georgia<br>
    <a href="tel:+17708452453" style="color:${RED};text-decoration:none;">770-845-2453</a>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function row(label, value, href) {
  const shown = href
    ? `<a href="${esc(href)}" style="color:${RED};text-decoration:none;">${esc(value)}</a>`
    : esc(value);
  return `<tr><td style="padding:7px 14px 7px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};white-space:nowrap;vertical-align:top;">${esc(label)}</td><td style="padding:7px 0;font-size:15px;color:${INK};">${shown}</td></tr>`;
}

async function accessToken(env) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    console.error("gmail token refresh failed", res.status, await res.text());
    return null;
  }
  return (await res.json()).access_token ?? null;
}

export function buildMime(from, to, subject, text, html, replyTo) {
  const b = `afi_${Date.now().toString(36)}`;
  return [
    `From: ${from}`,
    `To: ${to}`,
    ...(replyTo ? [`Reply-To: ${replyTo}`] : []),
    `Subject: ${header(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${b}"`,
    "",
    `--${b}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    b64(text),
    `--${b}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    b64(html),
    `--${b}--`,
    "",
  ].join("\r\n");
}

async function send(token, from, to, subject, text, html, replyTo) {
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: b64url(buildMime(from, to, subject, text, html, replyTo)),
      }),
    },
  );
  if (!res.ok) {
    console.error("gmail send failed", res.status, await res.text());
    return false;
  }
  return true;
}

async function resendSend(env, from, to, subject, text, html, replyTo) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    console.error("resend rejected the message", res.status, await res.text());
    return false;
  }
  return true;
}

/* Which transport to use, and the from address that goes with it. */
async function transport(env) {
  if (env.RESEND_API_KEY && env.MAIL_FROM) {
    const from = `A Fine Install <${env.MAIL_FROM}>`;
    return {
      kind: "resend",
      from,
      send: (to, subject, text, html, replyTo) =>
        resendSend(env, from, to, subject, text, html, replyTo),
    };
  }
  if (env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN) {
    const token = await accessToken(env);
    if (!token) return null;
    const sender = env.GMAIL_SENDER || "Afineinstall@gmail.com";
    const from = `A Fine Install <${sender}>`;
    return {
      kind: "gmail",
      from,
      send: (to, subject, text, html, replyTo) =>
        send(token, from, to, subject, text, html, replyTo),
    };
  }
  return null;
}

function stamp() {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());
  } catch {
    return new Date().toISOString();
  }
}

export function leadSubject(d) {
  const headline = d.service[0] ?? "an install";
  return `New quote request: ${d.name}${d.town ? `, ${d.town}` : ""} (${headline})`;
}

export async function sendQuoteEmails(env, d) {
  const post = await transport(env);
  if (!post) return { configured: false, notified: false, confirmed: false };

  const to = env.MAIL_TO || "Afineinstall@gmail.com";
  const wants = d.service;
  const headline = wants[0] ?? "an install";
  const when = stamp();
  const list = wants
    .map((s) => `<li style="margin:4px 0;color:${INK};">${esc(s)}</li>`)
    .join("");

  const leadHtml = shell(
    `${esc(d.name)} wants ${esc(headline.toLowerCase())}`,
    `<table role="presentation" cellpadding="0" cellspacing="0">${
      row("Name", d.name) +
      row("Phone", d.phone, `tel:${d.phone.replace(/[^\d+]/g, "")}`) +
      (d.email ? row("Email", d.email, `mailto:${d.email}`) : "") +
      (d.town ? row("Town", d.town) : "")
    }</table>
     <p style="margin:22px 0 6px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};">Wants</p>
     <ul style="margin:0;padding-left:20px;">${list}</ul>
     ${
       d.message
         ? `<p style="margin:22px 0 6px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};">Notes</p><p style="margin:0;white-space:pre-wrap;color:${INK};">${esc(d.message)}</p>`
         : ""
     }
     <p style="margin:26px 0 0 0;font-size:12px;color:${MUTED};">Sent from the website on ${esc(when)}. Reply to this email to answer ${esc(d.name)} directly.</p>`,
  );

  const leadText = [
    `${d.name} wants ${headline.toLowerCase()}`, "",
    `NAME   ${d.name}`, `PHONE  ${d.phone}`,
    `EMAIL  ${d.email || "not given"}`, `TOWN   ${d.town || "not given"}`, "",
    "WANTS", ...wants.map((s) => `  - ${s}`),
    ...(d.message ? ["", "NOTES", d.message] : []), "",
    `Sent from the website on ${when}.`,
  ].join("\n");

  const notified = await post.send(
    to, leadSubject(d), leadText, leadHtml, d.email,
  );

  let confirmed = false;
  if (d.email) {
    const custHtml = shell(
      "Thank you for choosing A Fine Install",
      `<p style="margin:0 0 16px 0;">We have your request and Stewart Tanner will get back to you soon, usually the same day.</p>
       <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};">You asked about</p>
       <ul style="margin:0 0 18px 0;padding-left:20px;">${list}</ul>
       <p style="margin:0 0 16px 0;">If it is urgent, calling is quicker than waiting on email: <a href="tel:+17708452453" style="color:${RED};font-weight:700;text-decoration:none;">770-845-2453</a>.</p>
       <p style="margin:0;color:${MUTED};font-size:13px;">You are getting this because you filled in the quote form on our website. We will not add you to any list.</p>`,
    );
    const custText = [
      "Thank you for choosing A Fine Install.", "",
      "We have your request and Stewart Tanner will get back to you soon, usually the same day.", "",
      "You asked about:", ...wants.map((s) => `  - ${s}`), "",
      "If it is urgent, calling is quicker: 770-845-2453", "",
      "A Fine Install, Gainesville, Georgia",
    ].join("\n");
    confirmed = await post.send(
      d.email,
      "Thank you for choosing A Fine Install", custText, custHtml, to,
    );
  }

  return { configured: true, notified, confirmed, via: post.kind };
}
