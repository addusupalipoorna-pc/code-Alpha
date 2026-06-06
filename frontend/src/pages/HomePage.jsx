import HeroSection from '../components/HeroSection.jsx';
import TranslationWorkspace from '../components/TranslationWorkspace.jsx';
import AnalyticsDashboard from '../components/AnalyticsDashboard.jsx';
import HistoryPanel from '../components/HistoryPanel.jsx';
import GSAPEffects from '../components/GSAPEffects.jsx';
import StatsCounters from '../components/StatsCounters.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Features from '../components/Features.jsx';
import GlobeLoader from '../components/GlobeLoader.jsx';

// keep a lazy import reference for deferred load (used by GlobeLoader)
const threeGlobeImport = () => import('../components/ThreeGlobe.jsx');

export default function HomePage({ history, setHistory }) {
  return (
    <main id="main-content" role="main" className="space-y-14">
      <GSAPEffects />
      <HeroSection />
      <div className="page-section">
        <TranslationWorkspace history={history} setHistory={setHistory} />
      </div>
      <section className="reveal">
        <h3 className="section-heading">Interactive Globe</h3>
        <GlobeLoader importFunc={threeGlobeImport} placeholder={<div className="glass-card p-6">Preview globe — click to load the interactive 3D globe.</div>} />
      </section>
      <section id="features" className="reveal">
        <h3 className="section-heading">Features</h3>
        <p className="section-lead">Enterprise-grade tools for global teams — voice, documents, and real-time workflows.</p>
        <Features />
      </section>

      <section className="reveal">
        <h3 className="section-heading">Statistics</h3>
        <StatsCounters items={[{ label: 'Languages Supported', value: '100' }, { label: 'Translations Daily', value: '50000' }, { label: 'Translation Accuracy', value: '99.8%' }, { label: 'AI Processing', value: '24/7' }]} />
      </section>

      <section className="reveal">
        <h3 className="section-heading">Testimonials</h3>
        <Testimonials />
      </section>
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <AnalyticsDashboard history={history} />
        <HistoryPanel history={history} setHistory={setHistory} />
      </div>
    </main>
  );
}
