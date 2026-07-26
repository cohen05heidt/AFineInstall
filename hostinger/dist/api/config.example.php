<?php
/* Copy this file to config.php on the server and fill it in.
   config.php is deliberately NOT in the GitHub repository, because these
   values are secrets. Never commit the filled in version. */

return [
  /* ---- Hostinger MySQL, from hPanel > Databases > Management ---- */
  'db_host' => 'localhost',
  'db_name' => 'u123456789_afineinstall',
  'db_user' => 'u123456789_afi',
  'db_pass' => 'the password you set',

  /* ---- Where the lead email is delivered ---- */
  'mail_to' => 'Afineinstall@gmail.com',

  /* ---- Gmail API, from the Google Cloud walkthrough ---- */
  'gmail_sender'        => 'Afineinstall@gmail.com',
  'gmail_client_id'     => '....apps.googleusercontent.com',
  'gmail_client_secret' => 'GOCSPX-....',
  'gmail_refresh_token' => '1//....',
];
