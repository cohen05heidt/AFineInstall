import { SITE } from "../lib/site";
import { Monogram, Wordmark } from "./Brand";

const LINKS = [
  { href: "#starlink", label: "Starlink" },
  { href: "#services", label: "Services" },
  { href: "#coverage", label: "Coverage" },
  { href: "#work", label: "Work" },
  { href: "#quote", label: "Contact" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[var(--afi-hair-soft)] bg-[color-mix(in_srgb,var(--afi-ink)_86%,transparent)] backdrop-blur-md md:h-[72px]">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-6 px-6 md:px-12">
        <a href="#top" className="flex items-center gap-3 text-[var(--afi-bone)]">
          <Monogram className="h-8 w-8" />
          <Wordmark className="text-lg md:text-xl" />
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="afi-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--afi-bone-dim)] transition-colors hover:text-[var(--afi-signal-lit)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href={SITE.phoneHref}
          className="afi-mono shrink-0 text-sm text-[var(--afi-bone)] transition-colors hover:text-[var(--afi-signal-lit)] md:text-base"
        >
          {SITE.phone}
        </a>
      </div>
    </header>
  );
}
