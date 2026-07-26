<?php
/* Quote form endpoint.

   Saves the request to MySQL first, then emails. Saving comes first on purpose:
   if Google is unreachable the enquiry is still on record and the customer
   still gets a success screen.

   Secrets live in config.php beside this file, which is not in the repository. */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require __DIR__ . '/compat.php';

function fail(string $code, int $status = 400): never {
  http_response_code($status);
  echo json_encode(['ok' => false, 'error' => $code]);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('method', 405);

$cfgPath = __DIR__ . '/config.php';
if (!is_file($cfgPath)) {
  error_log('quote.php: config.php missing');
  fail('not_configured', 500);
}
$cfg = require $cfgPath;

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 20000) fail('body');
$in = json_decode($raw, true);
if (!is_array($in)) fail('json');

/* ---------- validate ---------- */
$clean = static fn($v, int $max) => afi_substr(trim((string)($v ?? '')), 0, $max);

$name    = $clean($in['name'] ?? '', 120);
$phone   = $clean($in['phone'] ?? '', 40);
$email   = $clean($in['email'] ?? '', 160);
$town    = $clean($in['town'] ?? '', 120);
$message = $clean($in['message'] ?? '', 2000);
$service = $in['service'] ?? [];

if (afi_strlen($name) < 2) fail('name');
if (strlen(preg_replace('/\D/', '', $phone) ?? '') < 7) fail('phone');
if (!is_array($service) || count($service) < 1 || count($service) > 12) fail('service');
$service = array_values(array_filter(array_map(
  static fn($s) => afi_substr(trim((string)$s), 0, 80),
  $service
), static fn($s) => $s !== ''));
if (!$service) fail('service');
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $email = '';

/* ---------- save ---------- */
$confirmed = false;
$saved = false;
try {
  $pdo = new PDO(
    "mysql:host={$cfg['db_host']};dbname={$cfg['db_name']};charset=utf8mb4",
    $cfg['db_user'],
    $cfg['db_pass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false]
  );
  $pdo->exec(
    'CREATE TABLE IF NOT EXISTS quote_requests (
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
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
  );

  $ip = afi_substr((string)($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);

  /* light throttle: five submissions per address per ten minutes is plenty
     for a real customer and stops a bored bot filling the table */
  $recent = $pdo->prepare(
    'SELECT COUNT(*) FROM quote_requests
      WHERE ip = ? AND created_at > (NOW() - INTERVAL 10 MINUTE)'
  );
  $recent->execute([$ip]);
  if ((int)$recent->fetchColumn() >= 5) fail('slow_down', 429);

  $ins = $pdo->prepare(
    'INSERT INTO quote_requests (name, phone, email, town, service, message, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  $ins->execute([
    $name, $phone, $email ?: null, $town ?: null,
    implode(', ', $service), $message ?: null, $ip,
  ]);
  $saved = true;
} catch (Throwable $e) {
  error_log('quote.php db: ' . $e->getMessage());
}

/* ---------- email ---------- */
require __DIR__ . '/gmail.php';
$notified = false;
try {
  [$notified, $confirmed] = send_quote_mail($cfg, [
    'name' => $name, 'phone' => $phone, 'email' => $email,
    'town' => $town, 'service' => $service, 'message' => $message,
  ]);
} catch (Throwable $e) {
  error_log('quote.php mail: ' . $e->getMessage());
}

if (!$saved && !$notified) fail('storage', 500);

echo json_encode(['ok' => true, 'confirmed' => $confirmed]);
