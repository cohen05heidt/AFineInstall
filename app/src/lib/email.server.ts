import { bindings } from "./bindings.server";
import { transport } from "./mailer.server";
import { SITE } from "./site";

/* Transactional email for quote requests.
   The transport lives in mailer.server.ts (Gmail API first, an email provider
   second). This file only decides what the two messages say:

     1. the lead, to the shop, with reply-to set to the customer so a reply
        goes straight back to them
     2. a confirmation, to the customer, only when they gave an address

   Nothing in here is allowed to fail the form. The request is already saved in
   D1 by the time we get called, so every failure is caught, reported in the
   return value and logged, never thrown. */

export type QuoteData = {
  name: string;
  phone: string;
  email: string;
  town: string;
  service: string[];
  message: string;
};

export type MailResult = {
  configured: boolean;
  notified: boolean;
  confirmed: boolean;
};

/* user text goes into HTML, so it gets escaped. Without this a name
   containing a tag would break the markup or worse. */
const esc = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

const INK = "#0c1e19";
const RED = "#d23b2c";
const MUTED = "#5c6b63";

function shell(heading: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f2f1ec;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f1ec;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e0d8;">
  <tr><td style="height:5px;background:${RED};"></td></tr>
  <tr><td style="padding:30px 30px 8px 30px;font-family:Helvetica,Arial,sans-serif;">
    <div style="font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:${MUTED};">A Fine Install</div>
    <h1 style="margin:14px 0 0 0;font-size:23px;line-height:1.25;color:${INK};font-weight:700;">${heading}</h1>
  </td></tr>
  <tr><td style="padding:14px 30px 30px 30px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3b463f;">
    ${inner}
  </td></tr>
  <tr><td style="padding:18px 30px;border-top:1px solid #e2e0d8;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">
    A Fine Install &middot; ${SITE.base}<br>
    <a href="${SITE.phoneHref}" style="color:${RED};text-decoration:none;">${SITE.phone}</a>
    &middot;
    <a href="${SITE.emailHref}" style="color:${RED};text-decoration:none;">${SITE.email}</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function row(label: string, value: string, href?: string) {
  const shown = href
    ? `<a href="${esc(href)}" style="color:${RED};text-decoration:none;">${esc(value)}</a>`
    : esc(value);
  return `<tr>
    <td style="padding:7px 14px 7px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};white-space:nowrap;vertical-align:top;">${esc(label)}</td>
    <td style="padding:7px 0;font-size:15px;color:${INK};">${shown}</td>
  </tr>`;
}

export async function sendQuoteEmails(data: QuoteData): Promise<MailResult> {
  const post = transport();
  if (!post) {
    return { configured: false, notified: false, confirmed: false };
  }

  const to = bindings().QUOTE_TO_EMAIL || SITE.email;
  const when = stamp();
  const wants = data.service;
  const headline = wants[0] ?? "an install";

  /* ---- 1. the lead, to the shop ---- */
  const leadRows = [
    row("Name", data.name),
    row("Phone", data.phone, `tel:${data.phone.replace(/[^\d+]/g, "")}`),
    data.email ? row("Email", data.email, `mailto:${data.email}`) : "",
    data.town ? row("Town", data.town) : "",
  ].join("");

  const leadHtml = shell(
    `${esc(data.name)} wants ${esc(headline.toLowerCase())}`,
    `<table role="presentation" cellpadding="0" cellspacing="0">${leadRows}</table>
     <p style="margin:22px 0 6px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};">Wants</p>
     <ul style="margin:0;padding-left:20px;">${wants
       .map((s) => `<li style="margin:4px 0;color:${INK};">${esc(s)}</li>`)
       .join("")}</ul>
     ${
       data.message
         ? `<p style="margin:22px 0 6px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};">Notes</p>
            <p style="margin:0;white-space:pre-wrap;color:${INK};">${esc(data.message)}</p>`
         : ""
     }
     <p style="margin:26px 0 0 0;font-size:12px;color:${MUTED};">
       Sent from the website on ${esc(when)}. Reply to this email to answer
       ${esc(data.name)} directly.
     </p>`,
  );

  const leadText = [
    `${data.name} wants ${headline.toLowerCase()}`,
    ``,
    `NAME   ${data.name}`,
    `PHONE  ${data.phone}`,
    data.email ? `EMAIL  ${data.email}` : `EMAIL  not given`,
    data.town ? `TOWN   ${data.town}` : `TOWN   not given`,
    ``,
    `WANTS`,
    ...wants.map((s) => `  - ${s}`),
    ...(data.message ? [``, `NOTES`, data.message] : []),
    ``,
    `Sent from the website on ${when}.`,
  ].join("\n");

  const notified = await post.send({
    to,
    subject: `New quote request: ${data.name}${data.town ? `, ${data.town}` : ""} (${headline})`,
    html: leadHtml,
    text: leadText,
    ...(data.email ? { replyTo: data.email } : {}),
  });

  /* ---- 2. the confirmation, to the customer ---- */
  let confirmed = false;
  if (data.email) {
    const custHtml = shell(
      "Thank you for choosing A Fine Install",
      `<p style="margin:0 0 16px 0;">
         We have your request and ${esc(SITE.owner)} will get back to you soon,
         usually the same day.
       </p>
       <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${MUTED};">You asked about</p>
       <ul style="margin:0 0 18px 0;padding-left:20px;">${wants
         .map((s) => `<li style="margin:4px 0;color:${INK};">${esc(s)}</li>`)
         .join("")}</ul>
       <p style="margin:0 0 16px 0;">
         If it is urgent, calling is quicker than waiting on email:
         <a href="${SITE.phoneHref}" style="color:${RED};font-weight:700;text-decoration:none;">${SITE.phone}</a>.
       </p>
       <p style="margin:0;color:${MUTED};font-size:13px;">
         You are getting this because you filled in the quote form on our
         website. We will not add you to any list.
       </p>`,
    );

    const custText = [
      `Thank you for choosing A Fine Install.`,
      ``,
      `We have your request and ${SITE.owner} will get back to you soon, usually the same day.`,
      ``,
      `You asked about:`,
      ...wants.map((s) => `  - ${s}`),
      ``,
      `If it is urgent, calling is quicker: ${SITE.phone}`,
      ``,
      `A Fine Install, ${SITE.base}`,
      `${SITE.phone} / ${SITE.email}`,
    ].join("\n");

    confirmed = await post.send({
      to: data.email,
      subject: "Thank you for choosing A Fine Install",
      html: custHtml,
      text: custText,
      replyTo: to,
    });
  }

  return { configured: true, notified, confirmed };
}
