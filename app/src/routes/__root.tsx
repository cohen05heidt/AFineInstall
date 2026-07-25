import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import appMetaJson from "../app-meta.json";
import { SITE } from "../lib/site";

declare const __HF_DESIGN_INSPECTOR__: boolean;

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

const abs = (path: string) =>
  path.startsWith("http") ? path : `${SITE.origin}${path}`;

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? SITE.name;
  const description = meta.og_description ?? SITE.blurb;
  const ogImage = abs(meta.og_image_url ?? "/assets/brand/og-card.png");

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: SITE.name,
    description,
    telephone: SITE.phoneE164,
    email: SITE.email,
    url: SITE.origin,
    image: ogImage,
    priceRange: "$$",
    founder: { "@type": "Person", name: SITE.owner },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gainesville",
      addressRegion: "GA",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.lat,
      longitude: SITE.lon,
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: SITE.lat,
        longitude: SITE.lon,
      },
      geoRadius: "135000",
    },
    sameAs: [SITE.facebook],
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
  };

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: SITE.owner },
      { name: "theme-color", content: "#071410" },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE.origin },
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "A Fine Install" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous" as const,
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/assets/brand/favicon.svg", type: "image/svg+xml" },
      {
        rel: "icon",
        href: "/assets/brand/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        rel: "icon",
        href: "/assets/brand/favicon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      { rel: "apple-touch-icon", href: "/assets/brand/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "canonical", href: SITE.origin },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(localBusiness),
      },
    ],
  };
}

/* Both fallback screens are page furniture, not CTAs, so they share the
   quiet return-home treatment and never borrow a section CTA garment. */
function Fallback({
  code,
  heading,
  note,
}: {
  code: string;
  heading: string;
  note: string;
  }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="afi-mono text-sm text-[var(--afi-signal)]">{code}</p>
      <h1 className="afi-display mt-5 text-4xl md:text-5xl">{heading}</h1>
      <p className="afi-body mx-auto mt-4 text-base">{note}</p>
      <a
        href="/"
        className="afi-mono afi-sharp mt-9 border border-[var(--afi-hair)] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[var(--afi-bone)] transition-colors hover:border-[var(--afi-signal)] hover:text-[var(--afi-signal-lit)]"
      >
        Back to the start
      </a>
      <p className="afi-mono mt-12 text-xs text-[var(--afi-bone-faint)]">
        Or call {SITE.phone}
      </p>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <Fallback
      code="404"
      heading="That page is not wired up."
      note="The link you followed does not point anywhere on this site. Everything lives on one page, so the start is a good place to pick it up again."
    />
  ),
  errorComponent: ErrorComponent,
});

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="afi-mono text-sm text-[var(--afi-signal)]">Signal lost</p>
      <h1 className="afi-display mt-5 text-4xl md:text-5xl">
        This page did not load.
      </h1>
      <p className="afi-body mx-auto mt-4 text-base">
        Something failed on our end. Try again, and if it keeps happening a phone
        call still works fine.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="afi-mono afi-sharp border border-[var(--afi-hair)] px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:border-[var(--afi-signal)] hover:text-[var(--afi-signal-lit)]"
        >
          Try again
        </button>
        <a
          href={SITE.phoneHref}
          className="afi-mono afi-sharp bg-[var(--afi-signal)] px-6 py-3 text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-[var(--afi-signal-lit)]"
        >
          Call {SITE.phone}
        </a>
      </div>
    </main>
  );
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) return;
    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(
          error instanceof Error
            ? error
            : new Error("Failed to load design inspector"),
          { boundary: "higgsfield_design_inspector_import" },
        );
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
