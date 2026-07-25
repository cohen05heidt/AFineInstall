import type { CSSProperties } from "react";
import { MEASURED, SITE } from "../../lib/site";
import { QuoteInline } from "../cta";
import { useReveal } from "../../hooks/useReveal";

const KIT = [
  ["Standard kit", "Homes, shops and farms. Roof, pole or non penetrating mount."],
  ["Mini kit", "Campers, boats, job trailers and anywhere the power budget is tight."],
  ["Business and priority", "Higher priority data for shops, offices and job sites."],
];

export function Starlink() {
  const shown = useReveal(80);
  return (
    <section
      id="starlink"
      aria-labelledby="starlink-heading"
      className="relative border-t border-[var(--afi-hair-soft)] bg-[var(--afi-ground)] px-5 py-20 sm:px-6 md:px-12 md:py-32"
    >
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <h2
            id="starlink-heading"
            className="afi-display max-w-[20ch] text-[2rem] sm:text-5xl md:text-[3.4rem]"
          >
            We sell Starlink, and we set it up right.
          </h2>
          <p className="afi-body mt-7 text-base md:text-lg">
            Rural internet does not have to be a compromise. We order the kit,
            find the clear sky, mount it so it survives a Georgia summer, route
            the cable through a sealed entry, and hand the house back on a
            network that actually works in every room.
          </p>
          <dl className="mt-12 divide-y divide-[var(--afi-hair-soft)] border-y border-[var(--afi-hair-soft)]">
            {KIT.map(([term, def]) => (
              <div key={term} className="grid gap-1 py-5 sm:grid-cols-3 sm:gap-8">
                <dt className="afi-mono text-xs uppercase tracking-[0.16em] text-[var(--afi-bone)]">
                  {term}
                </dt>
                <dd className="text-sm text-[var(--afi-bone-dim)] sm:col-span-2">
                  {def}
                </dd>
              </div>
            ))}
          </dl>
          <QuoteInline className="mt-11 w-fit" />
        </div>

        <figure className="lg:col-span-5">
          <div className="relative mx-auto w-full max-w-[300px] border border-[var(--afi-hair)] bg-black p-2">
            <img
              src="/assets/starlink/speedtest.webp"
              width={295}
              height={640}
              loading="lazy"
              decoding="async"
              alt="Starlink app speed test from a completed customer install reading 309 megabits down, 17 up and 29 milliseconds of latency."
              className="w-full"
            />
          </div>
          <figcaption className="afi-mono mx-auto mt-5 max-w-[300px] text-[0.6875rem] uppercase leading-relaxed tracking-[0.14em] text-[var(--afi-bone-faint)]">
            Speed test on a finished install near {SITE.base}. Standard kit, no
            priority data.
          </figcaption>
        </figure>
      </div>

      {/* the oversized metrics strip: one layout family, used once */}
      <div
        data-shown={shown}
        className="afi-rise mx-auto mt-20 grid max-w-[1400px] grid-cols-3 border-t border-[var(--afi-signal)]"
        style={{ "--afi-rise-y": "22px" } as CSSProperties}
      >
        {[
          [MEASURED.down, "Mbps down"],
          [MEASURED.up, "Mbps up"],
          [MEASURED.latency, "ms latency"],
        ].map(([value, label], i) => (
          <div
            key={label as string}
            className={`px-1.5 pt-6 sm:px-2 sm:pt-8 md:px-6 ${i > 0 ? "border-l border-[var(--afi-hair-soft)]" : ""}`}
          >
            <p className="afi-mono text-[2.125rem] leading-none text-[var(--afi-bone)] sm:text-[4.5rem] md:text-[6rem]">
              {value as number}
            </p>
            <p className="afi-mono mt-2.5 text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--afi-bone-faint)] sm:mt-3 sm:text-xs sm:tracking-[0.2em]">
              {label as string}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
