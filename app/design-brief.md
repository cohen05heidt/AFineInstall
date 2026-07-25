# A Fine Install - design brief

## Design read
For homeowners, shop owners and builders in North Georgia who are tired of dead
rooms and bad internet, and who want the person who wires their house to be
careful. Emotional register: quiet competence. Field craft, not showroom gloss.

## Concept spine
**The signal chain.** The site follows one continuous signal from a satellite in
orbit, down a beam, onto a roof, through a wall, and out into every room of a
house. Every section is one more link in that chain. The page is a descent.

## Delivery tier
`cinema`. Scroll driven camera descent as the Tier 1 mechanic, scroll chapters,
Lenis plus GSAP bridge for surrounding motion.

## Animation mode
Animation mode: animated-website

### Journey (5 chapters, coded rather than generated)
1. **Orbit** - starfield, earth limb, constellation arcs. Focal point: one
   satellite crossing. Headline: from orbit to your wall plate.
2. **Lock** - the beam narrows and locks. Focal point: beam cone tip.
   Headline: Starlink, installed properly.
3. **Rooftop** - roofline in line art, dish on the ridge, cable routed to a
   sealed entry. Focal point: the dish mast.
4. **Inside** - house cutaway, signal spreading room to room, WiFi, sound, TV
   and camera nodes lighting in sequence. Focal point: the living room node.
5. **Territory** - camera pulls back until the house is one dot inside a two
   and a half hour driving radius. Focal point: Gainesville.

### Camera architecture
Architecture A, continuous forward flight. One persistent canvas world holds
every layer at a different depth. Scroll drives a single camera z value, so
position and velocity continuity are structural rather than stitched. Seam
direction is always forward and downward. Reverse scroll is the same function
run backwards, so every seam works in both directions.

### Deviation from the generated media chain (recorded)
The account has zero Higgsfield credits, so the seam locked MP4 chain and the
generated asset kit are not purchasable on this build. The user chose to ship a
fully coded version. The camera journey is therefore rendered live on a canvas
plus SVG layers, and every brand asset (logo, monogram, icon set, favicon set,
OG card, map, section plates) is authored in code or composed locally with
Playwright and ImageMagick. Photography is the client's own install photos.
No stock imagery, no picsum, no placeholder art anywhere.

### Mobile framing
Every focal point sits inside the center safe band. The canvas world drops
its two deepest parallax layers and halves star count below 900px. The map
switches from three state view to a cropped north Georgia view.

### Delivery budget
No video. Canvas is procedural. Total client photo payload target under 200 KB
for all ten gallery images, all WebP.

## Locked palette
Ground `#071410`, panel `#0C1E19`, raised `#143028`, hairline `#25443A`,
bone `#EDE7DA`, muted bone `#9FB0A6`, single accent signal red `#D23B2C`,
pressed accent `#8E2419`.
Defense: deep spruce is the colour of the pine ridges these installs sit under,
and signal red is already the client's own wordmark colour, so the brand stays
continuous with the truck and the business card. Spruce plus red sits clear of
the graphite plus ember, near black plus neon, beige plus brass, and violet glow
families.
One theme: the page is dark end to end. One accent, page wide.

## Locked type
`Geist` for display and body, `Geist Mono` for meta (coordinates, drive times,
spec figures, phone number). Chosen from the recipe pairings and pinned to
Google Fonts because the worker content security policy allows only
fonts.googleapis.com and fonts.gstatic.com, which rules out Fontshare. Display
character comes from scale and tracking (700 weight, tracking tighter, two line
maximum), not from a decorative face. No serif anywhere: this is a trade
business, not an editorial or heritage brand, so the recipe default holds.

## Motion dependencies
No new packages. Lenis and GSAP are not in the scaffold and adding them would
put the lockfile out of step with the trusted build, so the camera value, the
smoothing and the reveals are hand written over one requestAnimationFrame loop.
Everything animates transform and opacity only, and every animated element has
a prefers-reduced-motion fallback.

## Combinatorial pick
- Theme paradigm: Bold Studio Solid, deep spruce field
- Background character: solid field with a procedural canvas world behind it
- Typography character: expressive display over refined body
- Hero architecture: massive canvas first, restrained bottom left text
- Section system: poster stacked storytelling
- Signature components: vertical rhythm lines, diagonal staggered masonry,
  off grid editorial list, oversized metrics strip
- Narrative spine: journey and waypoints
- Second read moment: narrow vertical side rail note of live coordinates,
  placed once, on the coverage section

## Section plan (7 sections, 7 distinct layout families, 2 eyebrows of 3 allowed)
1. Hero - full bleed canvas stage, content bottom left (eyebrow 1)
2. Starlink - asymmetric split plus oversized metrics strip
3. Services - off grid editorial list, hairline divided, no card trio
4. Coverage - map as canvas plus vertical side rail (eyebrow 2)
5. Gallery - diagonal staggered masonry
6. Process - vertical rhythm line steps
7. Contact - colour blocked diptych, form beside details
No two adjacent sections share a family.

## Asset plan (all authored in code, zero generation)
- Journey world: layered canvas plus SVG, five chapters, one camera value
- Logo: `AFI` monogram, signal arc through the letterforms, inline SVG
- Icon set: 8 glyphs, one 1.6px stroke language, hand authored as a single
  React sprite, used across services and process
- Map: real projected geometry for Georgia, South Carolina, North Carolina
  from us-atlas, drive time rings generated with d3-geo
- Section plates: procedural spruce field gradients plus a hairline grid
- Photography: 10 curated client install photos, WebP, captioned
- Head kit: favicon.svg, favicon 32 and 16, apple touch 180, icon 192 and 512
  plus maskable, site.webmanifest, theme colour, full OG and Twitter block
- OG card: 1200x630 composed locally from the brand tokens

## CTA inventory (bespoke chrome, no shared button class)
- `PhoneSlab` (hero) - hairline framed slab, mono number, red rule that fills
  on hover, presses down 1px
- `QuoteInline` (Starlink) - inline label with a rule that draws left to right
- `ServiceHint` (services) - oversized service name, tiny arrow hint on hover
- `CoverageBanner` (coverage) - full width red band, label centred
- `FacebookMark` (social) - the single pill on the page, bordered, mark inside
- `FormSlab` (contact) - solid signal red slab, scales to 0.98 on press
One CTA label per intent, page wide: **Get a quote**.
