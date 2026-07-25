import { SITE } from "../lib/site";
import { Monogram, IconFacebook } from "./Brand";

export function Footer() {
  return (
    <footer className="border-t border-[var(--afi-hair)] bg-[var(--afi-ink)] px-5 py-12 sm:px-6 md:px-12 md:py-14">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Monogram className="h-10 w-10 text-[var(--afi-bone)]" />
          <p className="afi-display mt-5 text-2xl">
            A Fine <span className="text-[var(--afi-signal)]">Install</span>
          </p>
          <p className="afi-mono mt-3 text-[0.6875rem] uppercase tracking-[0.16em] text-[var(--afi-bone-faint)]">
            {SITE.owner} &middot; {SITE.base}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-12 gap-y-6">
          <a
            href={SITE.phoneHref}
            className="afi-mono text-xl text-[var(--afi-bone)] transition-colors hover:text-[var(--afi-signal-lit)]"
          >
            {SITE.phone}
          </a>
          <a
            href={SITE.emailHref}
            className="text-sm text-[var(--afi-bone-dim)] transition-colors hover:text-[var(--afi-bone)]"
          >
            {SITE.email}
          </a>
          <a
            href={SITE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="A Fine Install on Facebook"
            className="text-[var(--afi-bone-dim)] transition-colors hover:text-[var(--afi-signal-lit)]"
          >
            <IconFacebook className="h-6 w-6" />
          </a>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1400px] flex-wrap items-center justify-between gap-4 border-t border-[var(--afi-hair-soft)] pt-6">
        <p className="afi-mono text-[0.625rem] uppercase tracking-[0.16em] text-[var(--afi-bone-faint)]">
          Starlink is a trademark of SpaceX. We are an independent installer and
          reseller.
        </p>
        <p className="afi-mono text-[0.625rem] uppercase tracking-[0.16em] text-[var(--afi-bone-faint)]">
          Georgia &middot; South Carolina &middot; North Carolina
        </p>
      </div>
    </footer>
  );
}
