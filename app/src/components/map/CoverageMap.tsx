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

export function CoverageMap() {
  const [bx, by] = data.base;
  const outer = data.rings[data.rings.length - 1];

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
            style={{ ["--afi-ring-i" as string]: String(i) }}
          />
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
              className={isTown ? "hidden md:inline" : undefined}
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
      </svg>
    </figure>
  );
}
