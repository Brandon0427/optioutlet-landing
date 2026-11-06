import { PatternDefs } from './components/brand/PatternDefs';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { PatternStrip } from './components/layout/PatternStrip';
import { HEADER_OFFSET, ScrollTrigger, useGSAP } from './lib/gsap';
import { Consulta } from './sections/Consulta';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { Profiles } from './sections/Profiles';
import { PupilReveal } from './sections/PupilReveal';
import { Receta } from './sections/Receta';
import { StoreCta } from './sections/StoreCta';

/**
 * Arriving with a #hash: React mounts the sections after the browser looked for
 * the anchor, so the browser never scrolls to it. Scroll here instead, below the
 * fixed header. Called after the last ScrollTrigger.refresh(): pin-spacers move
 * the real position of every section below a pin.
 */
function scrollToHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: 'instant' });
}

export default function App() {
  // Children's layout effects run before the parent's, so every section has
  // created its ScrollTriggers by now. Calculate them in page order, then
  // again once fonts have loaded (they change heights and text lengths), and
  // only then honor a #hash in the URL.
  useGSAP(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve())
      .then(() => {
        if (!alive) return;
        ScrollTrigger.refresh();
        scrollToHash();
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
        <Consulta />
        <Receta />
        <StoreCta />
        <PatternStrip />
      </main>
      <Footer />
    </>
  );
}
