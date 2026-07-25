/* Single source of truth for the business facts. Every number, address and
   link on the page reads from here so nothing drifts between sections. */
export const SITE = {
  name: "A Fine Install",
  owner: "Stewart Tanner",
  origin: "https://afineinstall.higgsfield.app",
  blurb:
    "Starlink sales and installs, whole home WiFi, whole home sound, TV mounting, camera systems, wireless alarms and new construction prewire across North Georgia.",
  phone: "770-845-2453",
  phoneHref: "tel:+17708452453",
  phoneE164: "+1-770-845-2453",
  email: "Afineinstall@gmail.com",
  emailHref: "mailto:Afineinstall@gmail.com",
  facebook: "https://www.facebook.com/profile.php?id=61565698050427",
  base: "Gainesville, Georgia",
  lat: 34.2979,
  lon: -83.8241,
  driveHours: 1.5,
  driveMiles: 84,
} as const;

/* Measured on a customer install, Starlink standard kit. Real figures from a
   speed test on site, not marketing numbers. */
export const MEASURED = {
  down: 309,
  up: 17,
  latency: 29,
} as const;
