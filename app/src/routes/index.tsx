import { createFileRoute } from "@tanstack/react-router";

import { Nav } from "../components/Nav";
import { JourneyStage } from "../components/journey/JourneyStage";
import { Coverage } from "../components/sections/Coverage";
import { Starlink } from "../components/sections/Starlink";
import { Services } from "../components/sections/Services";
import { Gallery } from "../components/sections/Gallery";
import { Process } from "../components/sections/Process";
import { Contact } from "../components/sections/Contact";
import { Footer } from "../components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

/* One page, eight sections, each on its own layout family, and the section
   grounds alternate so no two neighbours sit on the same panel colour:
   journey (canvas chapters, ink) - coverage (map canvas + side rail, ground) -
   starlink (asymmetric split + metrics strip, ink) -
   services (hairline editorial list, ground) - work (diagonal masonry, ink) -
   process (vertical rhythm line, ground) -
   quote (colour blocked diptych) - footer.

   The map sits directly after the journey on purpose: the journey ends inside
   one house, and the very next question a visitor has is whether we come to
   theirs. */
function Index() {
  return (
    <>
      <Nav />
      <main>
        <JourneyStage />
        <Coverage />
        <Starlink />
        <Services />
        <Gallery />
        <Process />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
