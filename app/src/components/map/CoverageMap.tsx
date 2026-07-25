import type { CSSProperties } from "react";
import geo from "../../lib/data/coverage-geo.json";
import { SITE } from "../../lib/site";

/* Real geometry. State outlines come from the US census shapes in us-atlas,
   projected at build time, and the rings are true great circle radii around
   the shop, so the 2.5 hour line is drawn rather than guessed. */

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

/* Phones get a crop rather than the whole three state view. The crop box is
   measured off the real 150 minute ring, so it frames exactly the area we
   cover and nothing else. */
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
  return { x0, y0, x1, y1 };
}

function mobileCrop(d: string) {
  const { x0, y0, x1, y1 } = bbox(d);
  const pad = 14;
  const w = x1 - x0 + pad * 2;
  const h = y1 - y0 + pad * 2;
  const s = Math.min(1000 / w, 740 / h);
  return {
    "--afi-mz-s": s.toFixed(4),
    "--afi-mz-x": `${(500 - s * ((x0 + x1) / 2)).toFixed(2)}px`,
    "--afi-mz-y": `${(370 - s * ((y0 + y1) / 2)).toFixed(2)}px`,
  } as CSSProperties;
}

export function CoverageMap() {
  const [bx, by] = data.base;
  const outer = data.rings[data.rings.length - 1];
  const crop = mobileCrop(outer.d);
  /* the radar that used to explain these rings is gone, so the map labels
     them itself. Radius comes off each ring's own geometry. */
  const ringLabels = data.rings.map((r) => {
    const b = bbox(r.d);
    const radius = (b.x1 - b.x0) / 2;
    const a = -0.86;
    return {
      minutes: r.minutes,
      miles: r.miles,
      last: r === outer,
      lx: bx + Math.cos(a) * radius,
      ly: by + Math.sin(a) * radius,
    };
  });

  return (
    <figure className="relative">
      <svg
        viewBox={data.viewBox}
        className="w-full"
        role="img"
        aria-label={`Service area map. ${SITE.base} at the centre, with drive time rings at 45, 90 and 150 minutes reaching across Georgia, upstate South Carolina and western North Carolina.`}
      >
        <defs>
          <clipPath id="afi-inside">
            <path d={outer.d} />
          </clipPath>
          <radialGradient id="afi-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d23b2c" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#d23b2c" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="afi-map-zoom" style={crop}>
        {/* neighbouring states, kept faint so the three we cover read first */}
        {data.context.map((s) => (
          <path
            key={s.code}
            d={s.d}
            fill="#0c1e19"
            stroke="#1a332b"
            strokeWidth="1"
          />
        ))}

        {/* the three states we work in */}
        {data.states.map((s) => (
          <path
            key={s.code}
            d={s.d}
            fill="#102a23"
            stroke="#25443a"
            strokeWidth="1.4"
          />
        ))}

        {/* the covered wedge: the same three states, brightened only where the
            2.5 hour ring actually reaches */}
        <g clipPath="url(#afi-inside)">
          {data.states.map((s) => (
            <path key={`in-${s.code}`} d={s.d} fill="#1d4034" />
          ))}
          <circle cx={bx} cy={by} r="190" fill="url(#afi-core)" />
        </g>

        {data.rings.map((r, i) => (
          <path
            key={r.minutes}
            d={r.d}
            fill="none"
            stroke={i === data.rings.length - 1 ? "#d23b2c" : "#3c6455"}
            strokeWidth={i === data.rings.length - 1 ? 2 : 1.1}
            strokeDasharray={i === data.rings.length - 1 ? undefined : "4 7"}
            className="afi-ring"
            style={{ "--afi-ring-i": String(i) } as CSSProperties}
          />
        ))}

        {ringLabels.map((r) => (
          <g key={`lbl-ring-${r.minutes}`}>
            <rect
              x={r.lx - 3}
              y={r.ly - 15}
              width={r.last ? 92 : 84}
              height="20"
              fill="#0c1e19"
            />
            <text
              className="afi-map-ring"
              x={r.lx + 3}
              y={r.ly}
              fill={r.last ? "#e8543f" : "#7d938a"}
              fontSize="16"
              fontFamily="'Geist Mono', ui-monospace, monospace"
              letterSpacing="1"
            >
              {r.minutes} min
            </text>
          </g>
        ))}

        {/* the sweep, the one looping element on the page, and it sits on a
            radar so the loop is motivated */}
        <g clipPath="url(#afi-inside)">
          <line
            x1={bx}
            y1={by}
            x2={bx + 260}
            y2={by}
            stroke="#d23b2c"
            strokeWidth="1.6"
            opacity="0.5"
            className="afi-sweep"
            style={{ transformOrigin: `${bx}px ${by}px` }}
          />
        </g>

        {data.cities.map((c) => {
          const isBase = c.kind === "base";
          const isTown = c.kind === "town";
          return (
            <g
              key={c.name}
              className={
                isTown ? "hidden md:inline" : c.inside ? undefined : "afi-map-far"
              }
              opacity={c.inside ? 1 : 0.42}
            >
              <circle
                cx={c.x}
                cy={c.y}
                r={isBase ? 6 : isTown ? 2.4 : 3.6}
                fill={isBase ? "#d23b2c" : c.inside ? "#ede7da" : "#6c7f75"}
              />
              {isBase ? (
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="13"
                  fill="none"
                  stroke="#d23b2c"
                  strokeWidth="1.4"
                  className="afi-ping"
                />
              ) : null}
              <text
                className={isBase ? "afi-map-base" : "afi-map-city"}
                x={c.x + (isBase ? 18 : 8)}
                y={c.y + (isBase ? 5 : 3.4)}
                fill={isBase ? "#ede7da" : c.inside ? "#9fb0a6" : "#6c7f75"}
                fontSize={isBase ? 19 : isTown ? 12 : 15}
                fontFamily="'Geist Mono', ui-monospace, monospace"
                letterSpacing={isBase ? 1.4 : 0.4}
              >
                {isBase ? c.name.toUpperCase() : c.name}
              </text>
              {!isBase && !isTown ? (
                <text
                  className="afi-map-min"
                  x={c.x + 8}
                  y={c.y + 19}
                  fill="#4f6259"
                  fontSize="11.5"
                  fontFamily="'Geist Mono', ui-monospace, monospace"
                >
                  {c.minutes} min
                </text>
              ) : null}
            </g>
          );
        })}

        {data.states.map((s, i) => (
          <text
            className="afi-map-state"
            key={`lbl-${s.code}`}
            x={i === 0 ? 150 : i === 1 ? 690 : 690}
            y={i === 0 ? 640 : i === 1 ? 520 : 150}
            fill="#31544a"
            fontSize="21"
            fontFamily="'Geist Mono', ui-monospace, monospace"
            letterSpacing="3"
          >
            {STATE_LABEL[s.code]?.toUpperCase()}
          </text>
        ))}
        </g>
      </svg>
    </figure>
  );
}
