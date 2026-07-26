import { bindings } from "./bindings.server";

/* How mail actually leaves the Worker.

   A Worker cannot open an SMTP connection, so both transports here are plain
   HTTPS. Two are supported and the first one configured wins:

     1. GMAIL   sends as the Gmail account itself through the Gmail API. Google
                signs the message with its own DKIM, so there is no domain to
                buy or verify and deliverability is as good as it gets. Sent
                mail also lands in the account's Sent folder.
     2. RESEND  a normal email provider. Needs a domain you control, because
                you cannot claim to be a gmail.com address from someone else's
                servers without failing DMARC.

   If neither is configured, mail is skipped. Quote requests are already saved
   to the database before any of this runs, so nothing is ever lost. */

export type Message = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type Transport = {
  kind: "gmail" | "resend";
  from: string;
  send: (m: Message) => Promise<boolean>;
};

/* ---------- encoding helpers ---------- */

function b64(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
const utf8 = (s: string) => new TextEncoder().encode(s);
const b64utf8 = (s: string) => b64(utf8(s));
const b64url = (s: string) =>
  b64utf8(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

/* Headers must be ASCII. Anything else gets RFC 2047 encoded, otherwise a
   customer named with an accent breaks the subject line. */
const header = (v: string) =>
  /^[\x20-\x7E]*$/.test(v) ? v : `=?UTF-8?B?${b64utf8(v)}?=`;

/* ---------- Gmail API ---------- */

async function gmailAccessToken(
  id: string,
  secret: string,
  refresh: string,
): Promise<string | null> {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: id,
        client_secret: secret,
        refresh_token: refresh,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) {
      console.error("gmail token refresh failed", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
  } catch (err) {
    console.error("gmail token request threw", err);
    return null;
  }
}

function mime(from: string, m: Message) {
  const boundary = `afi_${Date.now().toString(36)}`;
  return [
    `From: ${from}`,
    `To: ${m.to}`,
    ...(m.replyTo ? [`Reply-To: ${m.replyTo}`] : []),
    `Subject: ${header(m.subject)}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64utf8(m.text),
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64utf8(m.html),
    `--${boundary}--`,
    ``,
  ].join("\r\n");
}

function gmailTransport(
  id: string,
  secret: string,
  refresh: string,
  sender: string,
): Transport {
  const from = `A Fine Install <${sender}>`;
  return {
    kind: "gmail",
    from,
    send: async (m) => {
      const token = await gmailAccessToken(id, secret, refresh);
      if (!token) return false;
      try {
        const res = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw: b64url(mime(from, m)) }),
          },
        );
        if (!res.ok) {
          console.error("gmail send failed", res.status, await res.text());
          return false;
        }
        return true;
      } catch (err) {
        console.error("gmail send threw", err);
        return false;
      }
    },
  };
}

/* ---------- Resend ---------- */

function resendTransport(key: string, sender: string): Transport {
  const from = `A Fine Install <${sender}>`;
  return {
    kind: "resend",
    from,
    send: async (m) => {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [m.to],
            subject: m.subject,
            html: m.html,
            text: m.text,
            ...(m.replyTo ? { reply_to: m.replyTo } : {}),
          }),
        });
        if (!res.ok) {
          console.error("resend rejected the message", res.status, await res.text());
          return false;
        }
        return true;
      } catch (err) {
        console.error("resend request threw", err);
        return false;
      }
    },
  };
}

export function transport(): Transport | null {
  const env = bindings();
  if (
    env.GMAIL_CLIENT_ID &&
    env.GMAIL_CLIENT_SECRET &&
    env.GMAIL_REFRESH_TOKEN
  ) {
    return gmailTransport(
      env.GMAIL_CLIENT_ID,
      env.GMAIL_CLIENT_SECRET,
      env.GMAIL_REFRESH_TOKEN,
      env.GMAIL_SENDER || "Afineinstall@gmail.com",
    );
  }
  if (env.RESEND_API_KEY && env.QUOTE_FROM_EMAIL) {
    return resendTransport(env.RESEND_API_KEY, env.QUOTE_FROM_EMAIL);
  }
  return null;
}
