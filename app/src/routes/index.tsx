import { createFileRoute } from "@tanstack/react-router";

import { Nav } from "../components/Nav";
import { JourneyStage } from "../components/journey/JourneyStage";
import { Starlink } from "../components/sections/Starlink";
import { Services } from "../components/sections/Services";
import { Coverage } from "../components/sections/Coverage";
import { Gallery } from "../components/sections/Gallery";
import { Process } from "../components/sections/Process";
import { Contact } from "../components/sections/Contact";
import { Footer } from "../components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

/* One page, eight sections, each on its own layout family:
   journey (canvas chapters) - starlink (asymmetric split + metrics strip) -
   services (hairline editorial list) - coverage (map canvas + side rail) -
   work (diagonal masonry) - process (vertical rhythm line) -
   quote (colour blocked diptych) - footer. */
function Index() {
  return (
    <>
      <Nav />
      <main>
        <JourneyStage />
        <Starlink />
        <Services />
        <Coverage />
        <Gallery />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
