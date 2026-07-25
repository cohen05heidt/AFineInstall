# A Fine Install

Marketing site for **A Fine Install**, a low voltage installer based in
Gainesville, Georgia. Starlink sales and installs, whole home WiFi, whole home
sound, TV mounting, camera systems, wireless alarms, outdoor property WiFi and
new construction prewire, across a 1.5 hour drive radius covering north Georgia,
the western edge of upstate South Carolina and the far southwestern tip of
North Carolina.

**Live:** https://afineinstall.higgsfield.app

Owner: Stewart Tanner  ·  770-845-2453  ·  Afineinstall@gmail.com

---

## What is interesting in here

### The scroll journey (`app/src/components/journey/`)

The hero is not an image or a video. It is one canvas world four viewports
deep, and the visitor's scroll drives a single camera value down it. Because
there is exactly one camera number, position and velocity stay continuous
across every scene boundary and scrolling back up is the same function run
backwards.

| Band | Scene | What is drawn |
|---|---|---|
| 0 | Orbit | Star field on three parallax planes, the earth limb, the orbital track, the satellite |
| 1 | Lock | The beam cone narrows from wide to locked through altitude ticks |
| 2 | Rooftop | A roofline with seams, the dish on the ridge, cable to a sealed entry |
| 3 | Inside | House cutaway, six service nodes lighting in sequence |

The drive radius was originally a fifth band drawn as a radar. It is now told
properly by the projected map in the coverage section, so the journey ends
inside the house and hands off instead of saying the same thing twice.

- `world.ts` is pure drawing. No React, no browser globals at module scope, so
  it imports safely into a server rendered route.
- `JourneyStage.tsx` owns the canvas, the scroll read, and one
  `requestAnimationFrame` loop with a lerp for smoothing.
- The star field is seeded deterministically, so a reload does not reshuffle
  the sky.
- The loop pauses via `IntersectionObserver` when the stage leaves the screen.
- Resize only relayouts when the width or orientation actually changed, so the
  iOS url bar hiding does not trigger a rebuild.
- `prefers-reduced-motion` paints a single composed still frame at camera 2.05
  and never starts the loop.

### The coverage map (`app/src/components/map/`)

Real geometry, not a drawing. `tools/genmap.mjs` takes census state shapes from
`us-atlas`, projects Georgia, South Carolina and North Carolina with
`d3-geo`, and generates true great circle rings at 28, 56 and 84 miles
(30, 60 and 90 minutes at 56 mph) around 34.2979 N, 83.8241 W. Output lands in
`app/src/lib/data/coverage-geo.json` and is read at build time.

Drive times per city are computed from real great circle distance, so the map
tells the truth rather than the marketing version. At 84 miles that means
Greenville, Asheville, Chattanooga, Augusta and Macon all fall outside the line
and render dimmed, while Anderson, Clemson, Franklin and Murphy fall inside.
Changing `MPH` or the ring minutes in `tools/genmap.mjs` reclassifies every city
automatically.

To regenerate after changing the base point or the radius:

```bash
npm i us-atlas topojson-client d3-geo
node tools/genmap.mjs
```

On phones the map crops to a box measured off the outer ring, so it frames only
the covered area, and the label type grows in SVG user units to stay legible.

### Everything visual is authored in code

There are no stock images and no generated art. The logo, the AFI monogram, the
eight glyph icon set, the favicon set, the maskable icon and the 1200x630 share
card are all hand drawn SVG or composed locally. The only photographs are the
client's own ten install photos in `app/public/assets/gallery/` and one Starlink
speed test screenshot.

The gallery is grouped by trade rather than shuffled: Starlink first, then TV
mounting, then cameras. Filenames match the grouping, so adding a photo means
dropping it in `app/public/assets/gallery/` and adding one entry to the right
group in `Gallery.tsx`.

### Quote form

`app/src/lib/api/quote.functions.ts` is a TanStack server function that
validates with Zod and writes to this site's own Cloudflare D1 database. The
table is defined in `app/migrations/0001_quote_requests.sql` and also created on
first use so a fresh deploy cannot drop a customer's message.

Services arrive as a list rather than a single choice, since one job is often
several installs, and are stored comma joined in the `service` column.

---

## Design decisions

Recorded in full in [`app/design-brief.md`](app/design-brief.md). The short
version:

- **Concept spine:** the signal chain. Every section is one more link between a
  satellite and a wall plate.
- **Palette:** deep spruce ground `#071410` / `#0c1e19`, bone `#ede7da`, and a
  single accent of signal red `#d23b2c`. Spruce is the colour of the pine
  ridges these installs sit under, and the red was already the wordmark colour
  on the business card, so the brand stays continuous with the truck.
- **Type:** Geist for display and body, Geist Mono for coordinates, drive times
  and spec figures. Display character comes from scale and tracking, not from a
  decorative face.
- **One accent, page wide. One theme, dark end to end. One corner language.**
- **No shared button class.** Each call to action is its own component with its
  own interaction identity: a hairline phone slab, an inline rule that draws, a
  full width red band, one pill, one solid form slab.
- **No new dependencies for motion.** The camera value, the smoothing and the
  reveals are hand written over one rAF loop, so the lockfile stays in step
  with the trusted build.
- Reveals fire on mount rather than on scroll into view, so nothing is ever
  stranded at zero opacity and a full page screenshot shows every section.

## Stack

- React 19 + TanStack Start, server rendered
- Tailwind CSS v4 with a custom token layer
- Cloudflare Workers, with D1 for quote requests
- Vite 7, built and deployed by Higgsfield CI

## Running it

```bash
cd app
bun install
bun run dev        # local dev
bun run typecheck  # tsc --noEmit
bun run build      # production build
```

`app/app.manifest.json` declares the infrastructure. `db: true` provisions the
D1 database bound as `env.DB`. There is a single live deploy and a single
database, so migrations should stay additive.

## Layout of the repo

```
app/
  design-brief.md              the design contract
  app.manifest.json            which Cloudflare bindings to provision
  migrations/                  D1 schema
  public/assets/
    brand/                     logo, favicon set, share card
    gallery/                   ten client install photos
    starlink/                  speed test screenshot
  src/
    components/
      journey/                 the scroll driven canvas world
      map/                     the projected coverage map
      sections/                one file per section
      Brand.tsx                monogram, wordmark, icon set
      cta.tsx                  the bespoke call to action garments
    hooks/useReveal.ts         mount reveals and pointer magnetism
    lib/site.ts                every business fact, single source of truth
    lib/api/                   server functions
    routes/                    file based routing
tools/genmap.mjs               regenerates the coverage geometry
```

## Notes

Starlink is a trademark of SpaceX. A Fine Install is an independent installer
and reseller.
