import { useReveal } from "../../hooks/useReveal";

/* Diagonal staggered masonry. Ten photographs from finished jobs, each one
   stepped down a little further than the last so the grid reads as a slope
   rather than a table. */

type Shot = { file: string; caption: string; alt: string; span?: boolean };

const SHOTS: Shot[] = [
  {
    file: "tv-stone-fireplace",
    caption: "TV and soundbar over a stone chimney breast",
    alt: "Large flat screen television and soundbar mounted flush on a white stone fireplace surround with a timber mantel.",
    span: true,
  },
  {
    file: "starlink-shop-roof",
    caption: "Starlink and a camera on a metal shop roof",
    alt: "Starlink dish and a security camera mounted on the eave of a metal roofed shop against a blue sky.",
  },
  {
    file: "sonos-ceiling-pair",
    caption: "In ceiling speaker, painted trim, no bracket showing",
    alt: "White in ceiling speaker mounted neatly against crown moulding on a painted wall.",
  },
  {
    file: "tv-beam-ceiling",
    caption: "Rustic stone, exposed beams, hidden cable",
    alt: "Wall mounted television and soundbar on a rough stone chimney under an exposed timber beam ceiling.",
    span: true,
  },
  {
    file: "starlink-ridge-mount",
    caption: "Ridge mount, clear of the tree line",
    alt: "Starlink dish mounted high on a shingle roof ridge, clear of a nearby tree, against a deep blue sky.",
  },
  {
    file: "camera-board-batten",
    caption: "Camera set into board and batten siding",
    alt: "Small wireless security camera mounted on cream board and batten siding above a window.",
  },
  {
    file: "tv-corner-hearth",
    caption: "Corner hearth, stacked stone, level every way",
    alt: "Television mounted above a stacked stone corner fireplace with a wooden mantel and hardwood floor.",
    span: true,
  },
  {
    file: "sonos-vaulted",
    caption: "Vaulted ceiling speaker, cable run in the wall",
    alt: "White speaker mounted high on a wall where it meets a vaulted ceiling in a bright hallway.",
  },
  {
    file: "sonos-arch",
    caption: "Above an archway, aimed into the room",
    alt: "White speaker mounted high on a wall beside a plaster archway, angled down into the room.",
  },
  {
    file: "camera-soffit",
    caption: "Soffit camera under a porch roof",
    alt: "Small camera fitted into the soffit of a porch roof next to a hanging fern.",
  },
];

export function Gallery() {
  const shown = useReveal(160);
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="relative border-t border-[var(--afi-hair-soft)] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            id="work-heading"
            className="afi-display max-w-[18ch] text-4xl sm:text-5xl md:text-[3.4rem]"
          >
            Finished jobs, photographed on the way out.
          </h2>
          <p className="afi-mono text-[0.625rem] uppercase tracking-[0.2em] text-[var(--afi-bone-faint)]">
            {SHOTS.length} of them
          </p>
        </div>

        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {SHOTS.map((s, i) => (
            <li
              key={s.file}
              data-shown={shown}
              className={`afi-rise group ${s.span ? "col-span-2 md:col-span-1" : ""}`}
              style={{
                ["--afi-rise-delay" as string]: `${i * 70}ms`,
                ["--afi-rise-y" as string]: "26px",
                /* the diagonal: every column sits a step lower */
                marginTop: `calc(${i % 4} * 1.35rem)`,
              }}
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
          ))}
        </ul>
      </div>
    </section>
  );
}
