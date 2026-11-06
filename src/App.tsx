import { PatternDefs } from './components/brand/PatternDefs';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { PatternStrip } from './components/layout/PatternStrip';
import { ScrollTrigger, useGSAP } from './lib/gsap';
import { ConsultaShell } from './sections/ConsultaShell';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { Profiles } from './sections/Profiles';
import { PupilReveal } from './sections/PupilReveal';
import { Receta } from './sections/Receta';
import { StoreCta } from './sections/StoreCta';

export default function App() {
  // Children's layout effects run before the parent's, so every section has
  // created its ScrollTriggers by now. Calculate them in page order, then
  // again once fonts have loaded (they change heights and text lengths).
  useGSAP(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    let alive = true;
    document.fonts?.ready
      .then(() => {
        if (alive) ScrollTrigger.refresh();
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  });

  return (
    <>
      <PatternDefs />
      <Header />
      <main>
        <Hero />
        <PupilReveal />
        <HowItWorks />
        <Profiles />
        <ConsultaShell />
        <Receta />
        <StoreCta />
        <PatternStrip />
      </main>
      <Footer />
    </>
  );
}
