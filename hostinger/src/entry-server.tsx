import { renderToString } from "react-dom/server";
import { App } from "./App";
import { SITE } from "./lib/site";

export function render() {
  return renderToString(<App />);
}

export const origin = SITE.origin;

export function jsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: SITE.name,
    description: SITE.blurb,
    telephone: SITE.phoneE164,
    email: SITE.email,
    url: SITE.origin,
    image: `${SITE.origin}/assets/brand/og-card.png`,
    priceRange: "$$",
    founder: { "@type": "Person", name: SITE.owner },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gainesville",
      addressRegion: "GA",
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.lat, longitude: SITE.lon },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: SITE.lat,
        longitude: SITE.lon,
      },
      geoRadius: String(Math.round(SITE.driveMiles * 1609)),
    },
    sameAs: [SITE.facebook, SITE.instagram],
    knowsAbout: [
      "Starlink installation",
      "Starlink sales",
      "whole home WiFi",
      "mesh WiFi",
      "whole home audio",
      "TV mounting",
      "security camera installation",
      "wireless alarm systems",
      "outdoor property WiFi",
      "new construction low voltage prewire",
    ],
  });
}
