import { Nav } from "./components/Nav";
import { JourneyStage } from "./components/journey/JourneyStage";
import { Coverage } from "./components/sections/Coverage";
import { Starlink } from "./components/sections/Starlink";
import { Services } from "./components/sections/Services";
import { Gallery } from "./components/sections/Gallery";
import { Process } from "./components/sections/Process";
import { Contact } from "./components/sections/Contact";
import { Footer } from "./components/Footer";

/* One page, eight sections, each on its own layout family, and the section
   grounds alternate so no two neighbours sit on the same panel colour. */
export function App() {
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
