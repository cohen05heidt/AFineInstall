import type { ComponentType } from "react";
import {
  IconAlarm, IconCamera, IconDish, IconGate, IconMesh, IconPrewire,
  IconScreen, IconSpeaker,
} from "../Brand";
import { useReveal } from "../../hooks/useReveal";

type Service = {
  name: string;
  detail: string;
  Icon: ComponentType<{ className?: string }>;
};

const SERVICES: Service[] = [
  {
    name: "Starlink sales and installs",
    detail: "Kit ordered, mounted, aimed, sealed and speed tested. Homes, small business, travel and commercial.",
    Icon: IconDish,
  },
  {
    name: "Whole home WiFi",
    detail: "Mesh with wired backhaul where it counts. One network name, no dead bedroom, no guessing which band to join.",
    Icon: IconMesh,
  },
  {
    name: "Whole home sound",
    detail: "In ceiling and in wall speakers, zoned so the kitchen and the porch do not have to agree.",
    Icon: IconSpeaker,
  },
  {
    name: "TV mounting",
    detail: "Over stone, over brick, over a fireplace. Power and data brought inside the wall so nothing hangs.",
    Icon: IconScreen,
  },
  {
    name: "Camera systems",
    detail: "Wired or wireless, recorded and viewable from your phone. Placed where they see something useful.",
    Icon: IconCamera,
  },
  {
    name: "Wireless alarms",
    detail: "Door, window and motion sensors with sirens and alerts that reach you wherever you are.",
    Icon: IconAlarm,
  },
  {
    name: "WiFi past the house",
    detail: "Shops, barns, gates, docks, guest houses and back pastures brought onto the same network.",
    Icon: IconGate,
  },
  {
    name: "New construction prewire",
    detail: "Data, speaker, camera and TV runs pulled before the drywall goes up, while it is still cheap and easy.",
    Icon: IconPrewire,
  },
];

/* services: its own CTA garment, an oversized name with a quiet arrow hint */
function ServiceHint() {
  return (
    <span
      aria-hidden="true"
      className="afi-mono shrink-0 self-start pt-2 text-xs text-[var(--afi-signal)] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
    >
      &rarr;
    </span>
  );
}

export function Services() {
  const shown = useReveal(120);
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="afi-field afi-field-fade relative border-t border-[var(--afi-hair-soft)] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <h2
          id="services-heading"
          className="afi-display max-w-[24ch] text-4xl sm:text-5xl md:text-[3.4rem]"
        >
          Eight things, all of them low voltage.
        </h2>

        <ul className="mt-16 border-t border-[var(--afi-hair)]">
          {SERVICES.map((s, i) => (
            <li key={s.name} className="border-b border-[var(--afi-hair-soft)]">
              <a
                href="#quote"
                data-shown={shown}
                className="afi-rise group flex items-start gap-5 py-7 md:gap-10 md:py-9"
                style={{
                  ["--afi-rise-delay" as string]: `${i * 55}ms`,
                  ["--afi-rise-y" as string]: "14px",
                  /* off grid: each row steps a little further in */
                  paddingLeft: `calc(${i % 4} * 0.9rem)`,
                }}
              >
                <s.Icon className="mt-1 h-7 w-7 shrink-0 text-[var(--afi-signal)] transition-transform duration-500 group-hover:scale-110 md:h-9 md:w-9 motion-reduce:transition-none" />
                <div className="min-w-0 flex-1 md:grid md:grid-cols-12 md:gap-10">
                  <h3 className="afi-display text-2xl leading-tight text-[var(--afi-bone)] transition-colors group-hover:text-[var(--afi-signal-lit)] md:col-span-5 md:text-[1.75rem] motion-reduce:transition-none">
                    {s.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--afi-bone-dim)] md:col-span-7 md:mt-0 md:text-base">
                    {s.detail}
                  </p>
                </div>
                <ServiceHint />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
