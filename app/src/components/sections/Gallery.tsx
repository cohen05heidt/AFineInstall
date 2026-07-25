import type { CSSProperties } from "react";
import { useReveal } from "../../hooks/useReveal";

/* Finished work, grouped by trade so a visitor looking for one thing sees all
   of it together. Ten photographs, all the client's own. */

type Shot = { file: string; caption: string; alt: string };
type Group = { id: string; label: string; note: string; shots: Shot[] };

const GROUPS: Group[] = [
  {
    id: "starlink",
    label: "Starlink",
    note: "Up where the sky is open, and mounted clean inside.",
    shots: [
      {
        file: "starlink-ridge-mount",
        caption: "Starlink ridge mount",
        alt: "Starlink mounted high on a shingle roof ridge against a deep blue sky.",
      },
      {
        file: "starlink-shop-roof",
        caption: "Starlink roof mount",
        alt: "Starlink mounted on the eave of a metal roofed shop against a blue sky.",
      },
      {
        file: "starlink-router-trim",
        caption: "Starlink mount tight to the ceiling line",
        alt: "White Starlink unit wall mounted on its bracket, set tight against the ceiling trim of a painted interior wall.",
      },
      {
        file: "starlink-router-vaulted",
        caption: "Starlink mount under a vaulted ceiling",
        alt: "White Starlink unit mounted high on a wall where it meets a vaulted ceiling, with the cable run inside the wall.",
      },
      {
        file: "starlink-router-arch",
        caption: "Starlink mount above an archway, out of the way",
        alt: "White Starlink unit mounted high on a wall beside a plaster archway, angled down into the room.",
      },
    ],
  },
  {
    id: "tv",
    label: "TV mounting",
    note: "Over stone, over brick, over a fireplace. Nothing hanging.",
    shots: [
      {
        file: "tv-stone-fireplace",
        caption: "TV and soundbar over a stone chimney breast",
        alt: "Large flat screen television and soundbar mounted flush on a white stone fireplace surround with a timber mantel.",
      },
      {
        file: "tv-beam-ceiling",
        caption: "Rustic stone, exposed beams, hidden cable",
        alt: "Wall mounted television and soundbar on a rough stone chimney under an exposed timber beam ceiling.",
      },
      {
        file: "tv-corner-hearth",
        caption: "Corner hearth, stacked stone, level every way",
        alt: "Television mounted above a stacked stone corner fireplace with a wooden mantel and hardwood floor.",
      },
    ],
  },
  {
    id: "cameras",
    label: "Cameras",
    note: "Set into the siding and the soffit, aimed at something useful.",
    shots: [
      {
        file: "camera-board-batten",
        caption: "Camera set into board and batten siding",
        alt: "Small wireless security camera mounted on cream board and batten siding above a window.",
      },
      {
        file: "camera-soffit",
        caption: "Soffit camera under a porch roof",
        alt: "Small camera fitted into the soffit of a porch roof next to a hanging fern.",
      },
    ],
  },
];

const TOTAL = GROUPS.reduce((n, g) => n + g.shots.length, 0);

export function Gallery() {
  const shown = useReveal(160);
  let index = 0;

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative border-t border-[var(--afi-hair-soft)] px-5 py-20 sm:px-6 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            id="work-heading"
            className="afi-display max-w-[18ch] text-[2rem] sm:text-5xl md:text-[3.4rem]"
          >
            Finished jobs, photographed on the way out.
          </h2>
          <p className="afi-mono text-[0.625rem] uppercase tracking-[0.2em] text-[var(--afi-bone-faint)]">
            {TOTAL} of them
          </p>
        </div>

        <div className="mt-14 space-y-16 md:mt-20 md:space-y-20">
          {GROUPS.map((group) => (
            <div key={group.id}>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-[var(--afi-hair)] pt-5">
                <h3 className="afi-display text-2xl md:text-[1.75rem]">
                  {group.label}
                </h3>
                <span className="afi-mono text-[0.625rem] uppercase tracking-[0.2em] text-[var(--afi-signal)]">
                  {group.shots.length}
                  {group.shots.length === 1 ? " job" : " jobs"}
                </span>
                <p className="w-full text-sm text-[var(--afi-bone-dim)] md:w-auto md:flex-1 md:text-right">
                  {group.note}
                </p>
              </div>

              <ul className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-5">
                {group.shots.map((s) => {
                  const delay = (index += 1) * 60;
                  return (
                    <li
                      key={s.file}
                      data-shown={shown}
                      className="afi-rise group"
                      style={
                        {
                          "--afi-rise-delay": `${delay}ms`,
                          "--afi-rise-y": "22px",
                        } as CSSProperties
                      }
                    >
                      <figure>
                        <div className="overflow-hidden border border-[var(--afi-hair-soft)] bg-[var(--afi-ground)]">
                          <img
                            src={`/assets/gallery/${s.file}.webp`}
                            width={480}
                            height={640}
                            loading="lazy"
                            decoding="async"
                            alt={s.alt}
                            className="aspect-[3/4] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                          />
                        </div>
                        <figcaption className="mt-4 flex items-start gap-3">
                          <span className="mt-[7px] h-px w-5 shrink-0 bg-[var(--afi-signal)]" />
                          <span className="text-[0.8125rem] leading-snug text-[var(--afi-bone-dim)]">
                            {s.caption}
                          </span>
                        </figcaption>
                      </figure>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
