import { useState } from "react";
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
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--afi-hair-soft)] bg-[color-mix(in_srgb,var(--afi-ink)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-6 md:h-[72px] md:px-12">
        <a
          href="#top"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-2.5 text-[var(--afi-bone)] sm:gap-3"
        >
          <Monogram className="h-7 w-7 sm:h-8 sm:w-8" />
          <Wordmark className="text-base sm:text-lg md:text-xl" />
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

        <div className="flex shrink-0 items-center gap-3">
          <a
            href={SITE.phoneHref}
            className="afi-mono text-[0.8125rem] text-[var(--afi-bone)] transition-colors hover:text-[var(--afi-signal-lit)] sm:text-sm md:text-base"
          >
            {SITE.phone}
          </a>
          {/* phones get a real menu instead of a hidden nav */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="afi-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center border border-[var(--afi-hair)] transition-colors hover:border-[var(--afi-signal)] active:translate-y-px lg:hidden"
          >
            <span className="relative block h-[11px] w-[17px]">
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-[var(--afi-bone)] transition-transform duration-300 motion-reduce:transition-none ${
                  open ? "top-[5px] rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-full bg-[var(--afi-bone)] transition-transform duration-300 motion-reduce:transition-none ${
                  open ? "top-[5px] -rotate-45" : "top-[9px]"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="afi-menu"
        hidden={!open}
        className="border-t border-[var(--afi-hair-soft)] bg-[var(--afi-ink)] lg:hidden"
      >
        <nav aria-label="Sections">
          <ul className="divide-y divide-[var(--afi-hair-soft)]">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-5 py-4 sm:px-6"
                >
                  <span className="afi-display text-xl text-[var(--afi-bone)]">
                    {l.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="afi-mono text-xs text-[var(--afi-signal)]"
                  >
                    &rarr;
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
