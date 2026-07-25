import type { CSSProperties } from "react";
import geo from "../../lib/data/coverage-geo.json";
import { SITE } from "../../lib/site";

/* Real geometry. State outlines come from the US census shapes in us-atlas,
   projected at build time, and the rings are true great circle radii around
   the shop, so the 1.5 hour line is drawn rather than guessed.

   The frame is computed FROM the outer ring rather than fixed to the three
   states, so the circle fills the picture and the towns inside it are legible.
   Change the radius in tools/genmap.mjs and the framing follows on its own.

   Every size below is written at 1000 unit scale and multiplied by `k`, the
   ratio between the real frame and that reference. That way the numbers stay
   readable and nothing has to be retuned by hand when the radius moves. */

type City = {
  name: string;
  kind: string;
  x: number;
  y: number;
  miles: number;
  minutes: number;
  inside: boolean;
};

const data = geo as unknown as {
  viewBox: string;
  states: { code: string; d: string }[];
  context: { code: string; d: string }[];
  rings: { minutes: number; miles: number; d: string }[];
  base: [number, number];
  cities: City[];
};

const STATE_LABEL: Record<string, string> = {
  GA: "Georgia",
  SC: "South Carolina",
  NC: "North Carolina",
};

function bbox(d: string) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g) ?? [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = Number(nums[i]);
    const y = Number(nums[i + 1]);
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

const ASPECT = 1.42;
const PAD = 1.22; /* frame half height as a multiple of the ring radius */

export function CoverageMap() {
  const [bx, by] = data.base;
  const outer = data.rings[data.rings.length - 1];
  const ring = bbox(outer.d);
  const r = (ring.x1 - ring.x0) / 2;

  const vh = r * 2 * PAD;
  const vw = vh * ASPECT;
  const view = { x: ring.cx - vw / 2, y: ring.cy - vh / 2, w: vw, h: vh };
  const k = vw / 1000; /* one scale factor for every stroke, dot and glyph */

  /* phones crop tighter still, as a transform on the drawn layer */
  const mScale = vh / (r * 2 * 1.04);
  const crop = {
    "--afi-k": String(k),
    "--afi-mz-s": mScale.toFixed(4),
    "--afi-mz-x": `${(view.x + vw / 2 - mScale * ring.cx).toFixed(2)}px`,
    "--afi-mz-y": `${(view.y + vh / 2 - mScale * ring.cy).toFixed(2)}px`,
  } as CSSProperties;

  const ringLabels = data.rings.map((rg) => {
    const b = bbox(rg.d);
    const rad = (b.x1 - b.x0) / 2;
    const a = -0.86;
    return {
      minutes: rg.minutes,
      last: rg === outer,
      lx: bx + Math.cos(a) * rad,
      ly: by + Math.sin(a) * rad,
    };
  });

  /* state names hang off the ring rather than sitting at fixed points, so they
     stay inside the frame whatever the radius is */
  const stateAt: Record<string, [number, number]> = {
    GA: [ring.cx - r * 0.86, ring.cy + r * 1.1],
    SC: [ring.cx + r * 1.06, ring.cy + r * 0.5],
    NC: [ring.cx + r * 0.66, ring.cy - r * 1.08],
  };

  return (
    <figure className="relative">
      <svg
        viewBox={`${view.x.toFixed(1)} ${view.y.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`}
        className="w-full"
        style={crop}
        role="img"
        aria-label={`Service area map. ${SITE.base} at the centre, with drive time rings at ${data.rings
          .map((rg) => rg.minutes)
          .join(", ")} minutes. The outer ring is ${SITE.driveHours} hours of driving, or ${SITE.driveMiles} miles, and it reaches all of north Georgia, the western edge of upstate South Carolina and the far southwestern tip of North Carolina.`}
      >
        <defs>
          <clipPath id="afi-inside">
            <path d={outer.d} />
          </clipPath>
          <radialGradient id="afi-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d23b2c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d23b2c" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="afi-map-zoom">
          {data.context.map((s) => (
            <path key={s.code} d={s.d} fill="#0c1e19" stroke="#1a332b" strokeWidth={k} />
          ))}

          {data.states.map((s) => (
            <path key={s.code} d={s.d} fill="#102a23" stroke="#2c4f43" strokeWidth={1.4 * k} />
          ))}

          {/* brighten the states only where the ring actually reaches */}
          <g clipPath="url(#afi-inside)">
            {data.states.map((s) => (
              <path key={`in-${s.code}`} d={s.d} fill="#1d4034" />
            ))}
            <circle cx={bx} cy={by} r={r * 1.4} fill="url(#afi-core)" />
          </g>

          {data.rings.map((rg, i) => {
            const last = i === data.rings.length - 1;
            return (
              <path
                key={rg.minutes}
                d={rg.d}
                fill="none"
                stroke={last ? "#d23b2c" : "#3c6455"}
                strokeWidth={(last ? 2 : 1.1) * k}
                strokeDasharray={last ? undefined : `${4 * k} ${7 * k}`}
                className="afi-ring"
                style={{ "--afi-ring-i": String(i) } as CSSProperties}
              />
            );
          })}

          {ringLabels.map((rg) => (
            <g key={`lbl-ring-${rg.minutes}`}>
              <rect
                x={rg.lx - 3 * k}
                y={rg.ly - 15 * k}
                width={(rg.last ? 92 : 84) * k}
                height={20 * k}
                fill="#0c1e19"
              />
              <text
                className="afi-map-ring"
                x={rg.lx + 3 * k}
                y={rg.ly}
                fill={rg.last ? "#e8543f" : "#7d938a"}
                fontSize={16 * k}
                fontFamily="'Geist Mono', ui-monospace, monospace"
                letterSpacing={k}
              >
                {rg.minutes} min
              </text>
            </g>
          ))}

          <g clipPath="url(#afi-inside)">
            <line
              x1={bx}
              y1={by}
              x2={bx + r}
              y2={by}
              stroke="#d23b2c"
              strokeWidth={1.6 * k}
              opacity="0.5"
              className="afi-sweep"
              style={{ transformOrigin: `${bx}px ${by}px` }}
            />
          </g>

          {data.cities.map((c) => {
            const isBase = c.kind === "base";
            const isMinor = c.kind === "minor";
            const isTown = c.kind === "town";
            /* minor places get a dot and nothing else: they sit almost on top
               of the shop and labelling them only made noise */
            if (isMinor) {
              return (
                <circle
                  key={c.name}
                  cx={c.x}
                  cy={c.y}
                  r={1.9 * k}
                  fill="#7d938a"
                />
              );
            }
            return (
              <g
                key={c.name}
                className={
                  isTown ? "hidden md:inline" : c.inside ? undefined : "afi-map-far"
                }
                opacity={c.inside ? 1 : 0.4}
              >
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={(isBase ? 6 : isTown ? 2.6 : 3.6) * k}
                  fill={isBase ? "#d23b2c" : c.inside ? "#ede7da" : "#6c7f75"}
                />
                {isBase ? (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={13 * k}
                    fill="none"
                    stroke="#d23b2c"
                    strokeWidth={1.4 * k}
                    className="afi-ping"
                  />
                ) : null}
                <text
                  className={isBase ? "afi-map-base" : "afi-map-city"}
                  x={c.x + (isBase ? 18 : 8) * k}
                  y={c.y + (isBase ? 5 : 3.4) * k}
                  fill={isBase ? "#ede7da" : c.inside ? "#c5d2ca" : "#6c7f75"}
                  fontSize={(isBase ? 19 : isTown ? 13 : 15.5) * k}
                  fontFamily="'Geist Mono', ui-monospace, monospace"
                  letterSpacing={(isBase ? 1.4 : 0.4) * k}
                >
                  {isBase ? c.name.toUpperCase() : c.name}
                </text>
                {!isBase && !isTown ? (
                  <text
                    className="afi-map-min"
                    x={c.x + 8 * k}
                    y={c.y + 19 * k}
                    fill="#4f6259"
                    fontSize={11.5 * k}
                    fontFamily="'Geist Mono', ui-monospace, monospace"
                  >
                    {c.minutes} min
                  </text>
                ) : null}
              </g>
            );
          })}

          {data.states.map((s) => (
            <text
              className="afi-map-state"
              key={`lbl-${s.code}`}
              x={stateAt[s.code]?.[0]}
              y={stateAt[s.code]?.[1]}
              fill="#31544a"
              fontSize={21 * k}
              fontFamily="'Geist Mono', ui-monospace, monospace"
              letterSpacing={3 * k}
              textAnchor="middle"
            >
              {STATE_LABEL[s.code]?.toUpperCase()}
            </text>
          ))}
        </g>
      </svg>
    </figure>
  );
}
