/* Vertical rhythm lines. Five steps hung off one continuous rule, which is
   the same line the signal has been following since the top of the page. */

const STEPS: Array<[string, string]> = [
  [
    "You call or send the form",
    "Tell us the town and roughly what you want. A photo of the room or the roof saves everyone a trip.",
  ],
  [
    "Site check and signal survey",
    "We look at sky view for Starlink, wall construction for mounts, and where the dead spots actually are.",
  ],
  [
    "A plan and a number",
    "Written out before anything gets drilled: what goes where, what it costs, how long it takes.",
  ],
  [
    "Install day",
    "Drop cloths down, cable inside the wall, everything labelled. We clean up before we leave.",
  ],
  [
    "Walkthrough and a speed test",
    "You watch it work on your own phone and your own TV. Then you have our number for later.",
  ],
];

export function Process() {
  return (
    <section
      aria-labelledby="process-heading"
      className="relative border-t border-[var(--afi-hair-soft)] bg-[var(--afi-ground)] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] lg:grid lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2
            id="process-heading"
            className="afi-display max-w-[16ch] text-4xl sm:text-5xl md:text-[3.4rem] lg:sticky lg:top-32"
          >
            How a job actually goes.
          </h2>
        </div>

        <ol className="relative mt-14 lg:col-span-8 lg:mt-0">
          <span
            aria-hidden="true"
            className="absolute bottom-6 left-[7px] top-3 w-px bg-[var(--afi-hair)]"
          />
          {STEPS.map(([title, body], i) => (
            <li key={title} className="relative pl-10 pb-12 last:pb-0 md:pl-14">
              <span
                aria-hidden="true"
                className="absolute left-0 top-2 flex h-[15px] w-[15px] items-center justify-center border border-[var(--afi-signal)] bg-[var(--afi-ground)]"
              >
                <span className="h-[5px] w-[5px] bg-[var(--afi-signal)]" />
              </span>
              <h3 className="afi-display text-2xl md:text-[1.75rem]">{title}</h3>
              <p className="afi-body mt-3 text-sm md:text-base">{body}</p>
              <span className="afi-mono mt-4 block text-[0.625rem] uppercase tracking-[0.2em] text-[var(--afi-bone-faint)]">
                Step {i + 1} of {STEPS.length}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
