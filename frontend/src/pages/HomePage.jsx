import HeroSection from '../components/HeroSection.jsx';
import TranslationWorkspace from '../components/TranslationWorkspace.jsx';
import AnalyticsDashboard from '../components/AnalyticsDashboard.jsx';
import HistoryPanel from '../components/HistoryPanel.jsx';
import GSAPEffects from '../components/GSAPEffects.jsx';
import StatsCounters from '../components/StatsCounters.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Features from '../components/Features.jsx';
import PricingSection from '../components/PricingSection.jsx';
import FAQSection from '../components/FAQSection.jsx';
import FooterSection from '../components/FooterSection.jsx';
import GlobeLoader from '../components/GlobeLoader.jsx';

const threeGlobeImport = () => import('../components/ThreeGlobe.jsx');

export default function HomePage({ history, setHistory }) {
  return (
    <main id="main-content" role="main" className="space-y-16 pb-12">
      <GSAPEffects />
      
      {/* Redesigned Premium Hero */}
      <HeroSection />

      {/* Core translation interface workspace */}
      <div className="page-section scroll-mt-24">
        <TranslationWorkspace history={history} setHistory={setHistory} />
      </div>

      {/* Dedicated Interactive Globe section below the translation workspace */}
      <section className="reveal py-10 px-4 md:px-8 border-t border-white/5 relative scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="text-xs uppercase font-extrabold text-cyan-400 tracking-widest">Global Network</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Interactive Translation Globe</h2>
            <p className="text-sm text-slate-400 mt-2">
              Visualize real-time translation routes and server node pathways across our global neural network.
            </p>
          </div>
          <div className="w-full max-w-4xl mx-auto card-glow-border rounded-3xl p-1 bg-gradient-to-b from-white/10 to-white/0 border border-white/10 backdrop-blur-md">
            <GlobeLoader
              importFunc={threeGlobeImport}
              placeholder={
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 h-96">
                  <div className="w-12 h-12 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4" />
                  <p className="text-sm font-semibold text-slate-300">Click below to activate neural globe visualization</p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="reveal scroll-mt-24">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="text-xs uppercase font-extrabold text-cyan-400 tracking-widest">Capabilities</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Platform Features</h2>
          <p className="text-sm text-slate-400 mt-2">Explore the tools built for high-performance localized translations.</p>
        </div>
        <Features />
      </section>

      {/* Stats Counters */}
      <section className="reveal">
        <StatsCounters />
      </section>

      {/* Infinite testimonials marquee */}
      <section className="reveal">
        <div className="text-center max-w-xl mx-auto mb-4">
          <p className="text-xs uppercase font-extrabold text-violet-400 tracking-widest">Reviews</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Trusted Globally</h2>
        </div>
        <Testimonials />
      </section>

      {/* Analytics & History timeline logs */}
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] reveal">
        <AnalyticsDashboard history={history} />
        <HistoryPanel history={history} setHistory={setHistory} />
      </div>

      {/* Pricing section */}
      <PricingSection />

      {/* FAQ section */}
      <FAQSection />

      {/* Footer */}
      <FooterSection />
    </main>
  );
}
