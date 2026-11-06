import { PatternDefs } from './components/brand/PatternDefs';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { PatternStrip } from './components/layout/PatternStrip';
import { ConsultaShell } from './sections/ConsultaShell';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { Profiles } from './sections/Profiles';
import { PupilReveal } from './sections/PupilReveal';
import { Receta } from './sections/Receta';
import { StoreCta } from './sections/StoreCta';

export default function App() {
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
