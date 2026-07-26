<?php
/* Sending mail as the Gmail account itself, over the Gmail API.

   Why not SMTP or PHP mail(): mail() from shared hosting sends from the
   server's own hostname, which fails the checks Gmail and Outlook run and
   usually lands in spam. Going through the Gmail API means Google sends the
   message and signs it, so it arrives like any other mail from that account
   and shows up in its Sent folder. */

declare(strict_types=1);

require_once __DIR__ . '/compat.php';

function g_b64url(string $s): string {
  return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}

function g_esc(string $s): string {
  return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/* headers must be ASCII, so anything else is RFC 2047 encoded */
function g_header(string $v): string {
  return preg_match('/^[\x20-\x7E]*$/', $v)
    ? $v
    : '=?UTF-8?B?' . base64_encode($v) . '?=';
}

function g_post(string $url, $body, array $headers = []): ?array {
  if (!function_exists('curl_init')) {
    error_log('gmail: the curl extension is not available on this host');
    return null;
  }
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => is_array($body) ? http_build_query($body) : $body,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_SSL_VERIFYPEER => true,
  ]);
  $res = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($res === false) { error_log("gmail curl: $err"); return null; }
  if ($code < 200 || $code >= 300) { error_log("gmail http $code: $res"); return null; }
  $json = json_decode((string)$res, true);
  return is_array($json) ? $json : [];
}

function g_access_token(array $cfg): ?string {
  $r = g_post('https://oauth2.googleapis.com/token', [
    'client_id' => $cfg['gmail_client_id'],
    'client_secret' => $cfg['gmail_client_secret'],
    'refresh_token' => $cfg['gmail_refresh_token'],
    'grant_type' => 'refresh_token',
  ]);
  return $r['access_token'] ?? null;
}

function g_send(string $token, string $from, string $to, string $subject, string $text, string $html, string $replyTo = ''): bool {
  $b = 'afi_' . bin2hex(random_bytes(8));
  $lines = ["From: $from", "To: $to"];
  if ($replyTo !== '') $lines[] = "Reply-To: $replyTo";
  $lines[] = 'Subject: ' . g_header($subject);
  $lines[] = 'MIME-Version: 1.0';
  $lines[] = "Content-Type: multipart/alternative; boundary=\"$b\"";
  $lines[] = '';
  $lines[] = "--$b";
  $lines[] = 'Content-Type: text/plain; charset="UTF-8"';
  $lines[] = 'Content-Transfer-Encoding: base64';
  $lines[] = '';
  $lines[] = rtrim(chunk_split(base64_encode($text), 76, "\r\n"));
  $lines[] = "--$b";
  $lines[] = 'Content-Type: text/html; charset="UTF-8"';
  $lines[] = 'Content-Transfer-Encoding: base64';
  $lines[] = '';
  $lines[] = rtrim(chunk_split(base64_encode($html), 76, "\r\n"));
  $lines[] = "--$b--";
  $lines[] = '';
  $raw = implode("\r\n", $lines);

  $r = g_post(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    json_encode(['raw' => g_b64url($raw)]),
    ["Authorization: Bearer $token", 'Content-Type: application/json']
  );
  return $r !== null;
}

const AFI_INK = '#0c1e19';
const AFI_RED = '#d23b2c';
const AFI_MUTED = '#5c6b63';

function g_shell(string $heading, string $inner): string {
  $ink = AFI_INK; $red = AFI_RED; $muted = AFI_MUTED;
  return '<!doctype html><html><body style="margin:0;padding:0;background:#f2f1ec;">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f1ec;padding:28px 12px;"><tr><td align="center">'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e0d8;">'
    . '<tr><td style="height:5px;background:' . $red . ';"></td></tr>'
    . '<tr><td style="padding:30px 30px 8px 30px;font-family:Helvetica,Arial,sans-serif;">'
    . '<div style="font-size:12px;letter-spacing:2.4px;text-transform:uppercase;color:' . $muted . ';">A Fine Install</div>'
    . '<h1 style="margin:14px 0 0 0;font-size:23px;line-height:1.25;color:' . $ink . ';font-weight:700;">' . $heading . '</h1>'
    . '</td></tr>'
    . '<tr><td style="padding:14px 30px 30px 30px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3b463f;">' . $inner . '</td></tr>'
    . '<tr><td style="padding:18px 30px;border-top:1px solid #e2e0d8;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:' . $muted . ';">'
    . 'A Fine Install &middot; Gainesville, Georgia<br>'
    . '<a href="tel:+17708452453" style="color:' . $red . ';text-decoration:none;">770-845-2453</a>'
    . '</td></tr></table></td></tr></table></body></html>';
}

function g_row(string $label, string $value, string $href = ''): string {
  $muted = AFI_MUTED; $ink = AFI_INK; $red = AFI_RED;
  $shown = $href !== ''
    ? '<a href="' . g_esc($href) . '" style="color:' . $red . ';text-decoration:none;">' . g_esc($value) . '</a>'
    : g_esc($value);
  return '<tr><td style="padding:7px 14px 7px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:' . $muted . ';white-space:nowrap;vertical-align:top;">'
    . g_esc($label) . '</td><td style="padding:7px 0;font-size:15px;color:' . $ink . ';">' . $shown . '</td></tr>';
}

/** @return array{0:bool,1:bool} [notified, confirmed] */
function send_quote_mail(array $cfg, array $d): array {
  foreach (['gmail_client_id', 'gmail_client_secret', 'gmail_refresh_token'] as $k) {
    if (empty($cfg[$k])) { error_log("gmail: $k not configured"); return [false, false]; }
  }
  $token = g_access_token($cfg);
  if ($token === null) return [false, false];

  $sender = $cfg['gmail_sender'] ?: 'Afineinstall@gmail.com';
  $from = 'A Fine Install <' . $sender . '>';
  $to = $cfg['mail_to'] ?: $sender;

  $wants = $d['service'];
  $headline = $wants[0] ?? 'an install';
  try {
    $when = (new DateTime('now', new DateTimeZone('America/New_York')))->format('M j, Y, g:i a');
  } catch (Throwable $e) {
    $when = gmdate('c');
  }

  $muted = AFI_MUTED; $ink = AFI_INK;
  $list = '';
  foreach ($wants as $w) $list .= '<li style="margin:4px 0;color:' . $ink . ';">' . g_esc($w) . '</li>';

  $rows = g_row('Name', $d['name'])
    . g_row('Phone', $d['phone'], 'tel:' . preg_replace('/[^\d+]/', '', $d['phone']))
    . ($d['email'] !== '' ? g_row('Email', $d['email'], 'mailto:' . $d['email']) : '')
    . ($d['town'] !== '' ? g_row('Town', $d['town']) : '');

  $leadHtml = g_shell(
    g_esc($d['name']) . ' wants ' . g_esc(afi_lower($headline)),
    '<table role="presentation" cellpadding="0" cellspacing="0">' . $rows . '</table>'
    . '<p style="margin:22px 0 6px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:' . $muted . ';">Wants</p>'
    . '<ul style="margin:0;padding-left:20px;">' . $list . '</ul>'
    . ($d['message'] !== ''
        ? '<p style="margin:22px 0 6px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:' . $muted . ';">Notes</p>'
          . '<p style="margin:0;white-space:pre-wrap;color:' . $ink . ';">' . g_esc($d['message']) . '</p>'
        : '')
    . '<p style="margin:26px 0 0 0;font-size:12px;color:' . $muted . ';">Sent from the website on ' . g_esc($when)
    . '. Reply to this email to answer ' . g_esc($d['name']) . ' directly.</p>'
  );

  $leadText = $d['name'] . ' wants ' . afi_lower($headline) . "\n\n"
    . 'NAME   ' . $d['name'] . "\n"
    . 'PHONE  ' . $d['phone'] . "\n"
    . 'EMAIL  ' . ($d['email'] !== '' ? $d['email'] : 'not given') . "\n"
    . 'TOWN   ' . ($d['town'] !== '' ? $d['town'] : 'not given') . "\n\n"
    . "WANTS\n  - " . implode("\n  - ", $wants) . "\n"
    . ($d['message'] !== '' ? "\nNOTES\n" . $d['message'] . "\n" : '')
    . "\nSent from the website on " . $when . ".\n";

  $subject = 'New quote request: ' . $d['name']
    . ($d['town'] !== '' ? ', ' . $d['town'] : '') . ' (' . $headline . ')';

  $notified = g_send($token, $from, $to, $subject, $leadText, $leadHtml, $d['email']);

  $confirmed = false;
  if ($d['email'] !== '') {
    $custHtml = g_shell(
      'Thank you for choosing A Fine Install',
      '<p style="margin:0 0 16px 0;">We have your request and Stewart Tanner will get back to you soon, usually the same day.</p>'
      . '<p style="margin:0 0 6px 0;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:' . $muted . ';">You asked about</p>'
      . '<ul style="margin:0 0 18px 0;padding-left:20px;">' . $list . '</ul>'
      . '<p style="margin:0 0 16px 0;">If it is urgent, calling is quicker than waiting on email: '
      . '<a href="tel:+17708452453" style="color:' . AFI_RED . ';font-weight:700;text-decoration:none;">770-845-2453</a>.</p>'
      . '<p style="margin:0;color:' . $muted . ';font-size:13px;">You are getting this because you filled in the quote form on our website. We will not add you to any list.</p>'
    );
    $custText = "Thank you for choosing A Fine Install.\n\n"
      . "We have your request and Stewart Tanner will get back to you soon, usually the same day.\n\n"
      . "You asked about:\n  - " . implode("\n  - ", $wants) . "\n\n"
      . "If it is urgent, calling is quicker: 770-845-2453\n\n"
      . "A Fine Install, Gainesville, Georgia\n";
    $confirmed = g_send($token, $from, $d['email'], 'Thank you for choosing A Fine Install', $custText, $custHtml, $to);
  }

  return [$notified, $confirmed];
}
