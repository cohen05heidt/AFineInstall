import { SITE } from "../../lib/site";
import { CoverageBanner } from "../cta";
import { CoverageMap } from "../map/CoverageMap";
import { IconPin } from "../Brand";

const RAIL = [
  ["34.2979 N", "83.8241 W"],
  ["Base", SITE.base],
  ["Radius", `${SITE.driveMiles} mi`],
  ["Drive", `${SITE.driveHours} hr`],
];

export function Coverage() {
  return (
    <section
      id="coverage"
      aria-labelledby="coverage-heading"
      className="relative border-t border-[var(--afi-hair-soft)] bg-[var(--afi-ground)]"
    >
      <div className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-6 md:px-12 md:pt-32">
        <p className="afi-eyebrow">Service area</p>
        <h2
          id="coverage-heading"
          className="afi-display mt-5 max-w-[22ch] text-[2rem] sm:text-5xl md:text-[3.4rem]"
        >
          If we can drive it in a morning, we cover it.
        </h2>
        <p className="afi-body mt-7 text-base md:text-lg">
          Everything inside the red line is a normal service call from{" "}
          {SITE.base}: all of north Georgia, the western edge of upstate South
          Carolina, and the far southwestern tip of North Carolina. Outside it,
          ask anyway. Bigger jobs travel further.
        </p>
      </div>

      {/* map as canvas, with the one vertical side rail on the page */}
      <div className="relative mx-auto mt-10 max-w-[1400px] px-5 pb-16 sm:px-6 md:mt-14 md:px-12 md:pb-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-10">
            <CoverageMap />
          </div>
          <aside
            aria-label="Shop coordinates"
            className="mt-10 flex flex-row flex-wrap gap-x-10 gap-y-5 border-t border-[var(--afi-hair)] pt-6 lg:col-span-2 lg:mt-0 lg:flex-col lg:border-l lg:border-t-0 lg:pl-6 lg:pt-2"
          >
            <IconPin className="hidden h-6 w-6 text-[var(--afi-signal)] lg:block" />
            {RAIL.map(([k, v]) => (
              <div key={k}>
                <p className="afi-mono text-[0.625rem] uppercase tracking-[0.2em] text-[var(--afi-bone-faint)]">
                  {k}
                </p>
                <p className="afi-mono mt-1 text-sm text-[var(--afi-bone)]">{v}</p>
              </div>
            ))}
          </aside>
        </div>
      </div>

      <CoverageBanner />
    </section>
  );
}
