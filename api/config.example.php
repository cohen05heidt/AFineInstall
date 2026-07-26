<?php
/* Copy this to config.php on the server and fill it in.
   config.php is deliberately NOT in the GitHub repository. Never commit it. */

return [
  /* ---- Hostinger MySQL, from hPanel > Databases > Management ---- */
  'db_host' => 'localhost',
  'db_name' => 'u167498496_afineinstall',
  'db_user' => 'u167498496_afi',
  'db_pass' => '',

  /* ---- where the lead email is delivered ---- */
  'mail_to' => 'Afineinstall@gmail.com',

  /* ---- Resend: the preferred transport. mail_from must be at a domain
         verified in Resend, which is why it is at afineinstall.com and not
         at gmail.com ---- */
  'resend_api_key' => '',
  'mail_from' => 'quotes@afineinstall.com',

  /* ---- Gmail API: only used if resend_api_key is empty ---- */
  'gmail_sender'        => 'Afineinstall@gmail.com',
  'gmail_client_id'     => '',
  'gmail_client_secret' => '',
  'gmail_refresh_token' => '',
];
