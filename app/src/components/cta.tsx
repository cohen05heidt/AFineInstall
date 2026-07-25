import { SITE } from "../lib/site";
import { IconFacebook } from "./Brand";
import { useMagnet } from "../hooks/useReveal";

/* Bespoke chrome. Every call to action on this page is its own component with
   its own interaction identity. There is deliberately no shared button class,
   and every label for the quote intent reads "Get a quote". */

/* hero: a hairline slab with the number set in mono and a red rule that
   fills from the left on hover */
export function PhoneSlab() {
  return (
    <a
      href={SITE.phoneHref}
      className="group relative inline-flex items-baseline gap-2.5 overflow-hidden border border-[var(--afi-hair)] px-5 py-3.5 transition-transform active:translate-y-px sm:gap-3 sm:px-6 sm:py-4"
    >
      <span className="afi-mono relative z-10 text-xs uppercase tracking-[0.2em] text-[var(--afi-bone-faint)] transition-colors group-hover:text-[var(--afi-bone)]">
        Call
      </span>
      <span className="afi-mono relative z-10 text-base text-[var(--afi-bone)] sm:text-lg md:text-xl">
        {SITE.phone}
      </span>
      <span className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-[var(--afi-signal)] transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
    </a>
  );
}

/* hero and starlink: an inline label whose rule draws left to right */
export function QuoteInline({ className = "" }: { className?: string }) {
  return (
    <a href="#quote" className={`group inline-flex flex-col gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-2 text-base font-medium text-[var(--afi-bone)]">
        Get a quote
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
          &rarr;
        </span>
      </span>
      <span className="h-px w-full origin-left scale-x-[0.28] bg-[var(--afi-signal)] transition-transform duration-500 ease-out group-hover:scale-x-100 motion-reduce:transition-none" />
    </a>
  );
}

/* coverage: a full width red band, the loudest thing on the page, used once */
export function CoverageBanner() {
  return (
    <a
      href="#quote"
      className="group flex w-full items-center justify-center gap-4 bg-[var(--afi-signal)] px-5 py-6 text-center transition-colors hover:bg-[var(--afi-signal-lit)] active:translate-y-px sm:px-6 md:py-7"
    >
      <span className="afi-display text-balance text-center text-lg text-white sm:text-xl md:text-2xl">
        Not sure if your place is in range
      </span>
      <span className="afi-mono hidden text-xs uppercase tracking-[0.22em] text-white/80 transition-transform duration-300 group-hover:translate-x-1 md:inline motion-reduce:transition-none">
        Get a quote &rarr;
      </span>
    </a>
  );
}

/* social: the single pill on the page, and the only magnetic element */
export function FacebookMark() {
  const ref = useMagnet(0.18);
  return (
    <a
      ref={ref}
      href={SITE.facebook}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 rounded-full border border-[var(--afi-hair)] bg-[var(--afi-raised)] py-3 pl-4 pr-6 text-[var(--afi-bone)] transition-colors hover:border-[var(--afi-signal)] hover:text-white"
    >
      <IconFacebook className="h-5 w-5 text-[var(--afi-signal)]" />
      <span className="text-sm font-medium">Follow on Facebook</span>
    </a>
  );
}

/* contact: a solid slab that presses in, distinct from every garment above */
export function FormSlab({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="afi-mono w-full bg-[var(--afi-signal)] px-6 py-4 text-xs uppercase tracking-[0.22em] text-white transition-all duration-200 hover:bg-[var(--afi-signal-lit)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--afi-signal-deep)] disabled:text-white/70 motion-reduce:transition-none"
    >
      {pending ? "Sending" : "Get a quote"}
    </button>
  );
}
