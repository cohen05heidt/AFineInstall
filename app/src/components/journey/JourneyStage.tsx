import { useEffect, useRef } from "react";
import { TRAVEL, STILL_CAM, drawWorld, makeStars, type Star } from "./world";
import { SITE } from "../../lib/site";
import { PhoneSlab, QuoteInline } from "../cta";

/* The camera journey. One canvas world, one scroll derived camera value.
   Everything that touches the browser lives inside the effect, so the whole
   stage renders on the server as plain readable chapters.

   Four chapters, ending inside the house. The drive radius is not told here
   any more: the coverage section does it properly with projected geometry, and
   saying it twice made the page repeat itself. */

type Chapter = {
  id: string;
  heading: string;
  line: string;
  tags: string[];
};

const CHAPTERS: Chapter[] = [
  {
    id: "orbit",
    heading: "",
    line: "",
    tags: [],
  },
  {
    id: "lock",
    heading: "Starlink, aimed and locked.",
    line: "We sell the kit and we set it up. Clear sky check, mast height, cable run, sealed entry, then a speed test on your own devices before we leave.",
    tags: ["Homes", "Shops and farms", "RV and travel", "Commercial"],
  },
  {
    id: "rooftop",
    heading: "Mounted where it belongs.",
    line: "Ridge, gable, pole or a shop roof. Starlink goes where the sky is open and the cable takes the shortest honest path inside.",
    tags: ["Sealed penetrations", "Cable routed clean", "No dangling wire"],
  },
  {
    id: "inside",
    heading: "Then the signal goes everywhere.",
    line: "One network name across the whole house and yard. Sound in the ceilings, the TV on the wall, cameras on the corners, alarms that reach your phone.",
    tags: ["Mesh and wired backhaul", "Zoned audio", "Recorded video"],
  },
];

export function JourneyStage() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let w = 0;
    let h = 0;
    let lastW = -1;
    let compact = false;
    let stars: Star[] = [];
    let target = 0;
    let smooth = 0;
    let raf = 0;
    let running = false;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      compact = w < 900;
      stars = makeStars(compact ? 130 : 300);
    };

    const readScroll = () => {
      const r = host.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / span));
      target = p * TRAVEL;
    };

    const paint = (cam: number, t: number, still: boolean) =>
      drawWorld({ ctx, w, h, cam, t, stars, compact, still });

    const tick = (t: number) => {
      smooth += (target - smooth) * 0.14;
      if (Math.abs(target - smooth) < 0.0004) smooth = target;
      paint(smooth, t, false);
      raf = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduce.matches) return;
      running = true;
      raf = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    };

    /* first paint is immediate and matches scroll position zero, so the top
       of the page is never an empty box */
    size();
    lastW = window.innerWidth;
    readScroll();
    smooth = target;
    if (reduce.matches) {
      paint(STILL_CAM, 0, true);
    } else {
      paint(smooth, 0, true);
      start();
    }

    /* touch browsers fire resize when the url bar hides. Only relayout when
       the width or orientation actually changed. */
    const onResize = () => {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      size();
      readScroll();
      smooth = target;
      paint(reduce.matches ? STILL_CAM : smooth, 0, true);
    };

    const onMotionChange = () => {
      stop();
      if (reduce.matches) paint(STILL_CAM, 0, true);
      else start();
    };

    /* pause the loop whenever the stage is off screen */
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) start();
        else stop();
      },
      { rootMargin: "120px" },
    );
    io.observe(host);

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    reduce.addEventListener("change", onMotionChange);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      reduce.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      id="top"
      className="relative"
    >
      <div className="pointer-events-none sticky top-0 h-dvh w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--afi-ink)] to-transparent" />
      </div>

      <div className="relative" style={{ marginTop: "-100dvh" }}>
        {CHAPTERS.map((c, i) =>
          i === 0 ? (
            <section
              key={c.id}
              aria-labelledby="hero-heading"
              className="flex h-[80dvh] flex-col justify-end px-5 pb-9 pt-20 sm:px-6 md:h-[84dvh] md:px-12 md:pb-14"
            >
              <p className="afi-eyebrow">{SITE.base}</p>
              <h1
                id="hero-heading"
                className="afi-display mt-4 max-w-[15ch] text-[2.75rem] leading-[0.98] sm:text-6xl md:text-7xl"
              >
                From orbit to your{" "}
                <span className="text-[var(--afi-signal)]">wall plate</span>.
              </h1>
              <p className="afi-body mt-5 text-base md:text-lg">
                Satellite sales and installs, whole home WiFi, sound, TV and camera
                systems across North Georgia.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-10 gap-y-6">
                <PhoneSlab />
                <QuoteInline />
              </div>
            </section>
          ) : (
            <article
              key={c.id}
              className="flex h-[86dvh] flex-col justify-end px-5 pb-16 sm:px-6 md:h-dvh md:px-12 md:pb-28"
            >
              <div className="max-w-xl border-l border-[var(--afi-signal)] pl-5 md:pl-8">
                <h2 className="afi-display text-[1.75rem] sm:text-4xl md:text-5xl">
                  {c.heading}
                </h2>
                <p className="afi-body mt-4 text-[0.9375rem] sm:mt-5 sm:text-base">
                  {c.line}
                </p>
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 sm:mt-6 sm:gap-x-6">
                  {c.tags.map((tag) => (
                    <li
                      key={tag}
                      className="afi-mono text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--afi-bone-faint)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  );
}
