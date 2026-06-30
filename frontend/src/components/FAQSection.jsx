import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiChevronDown, BiSearch } from 'react-icons/bi';

const faqs = [
  {
    q: 'How accurate is the translation output?',
    a: 'We leverage multi-model neural translation architectures combined with secondary contextual correction models. Average semantic alignment score reaches 99.8% depending on the source complexity.',
    category: 'usage'
  },
  {
    q: 'Why does the voice recording fallback exist?',
    a: 'Some browsers (like Firefox and Safari) do not ship native support for the Web Speech Recognition API. On these browsers, our workspace automatically falls back to raw MediaRecorder WAV streaming and uses server-side Google speech recognition APIs.',
    category: 'audio'
  },
  {
    q: 'Are there characters or request limits?',
    a: 'The Free tier is limited to 2,000 characters per single query. Upgrading to the Pro tier unlocks completely unlimited characters and batch translation capabilities.',
    category: 'limits'
  },
  {
    q: 'Can I export my translation files?',
    a: 'Absolutely! You can download your translations as raw text (.txt) files or compile them into fully formatted corporate PDF translation reports directly in your browser.',
    category: 'usage'
  },
  {
    q: 'Is my input text stored on your servers?',
    a: 'We respect user privacy. Translation history logs are saved entirely on your local machine using local storage, and server-side speech recognition byte arrays are processed instantly in-memory without persistent logs.',
    category: 'privacy'
  }
];

export default function FAQSection() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  const filteredFaqs = faqs.filter((f) => {
    const matchesSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="faq" className="faq-section py-16 px-4 md:px-8 border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-xs uppercase font-extrabold text-violet-400 tracking-widest">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400 mt-2">
            Find answers to common questions about voice recognition, document translation exports, and SaaS tiers.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="grid gap-4 md:grid-cols-12 mb-8 items-center">
          <div className="md:col-span-7 relative">
            <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4.5 w-4.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions or answers..."
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-medium text-slate-200 outline-none focus:border-cyan-500/30 transition placeholder-slate-600"
              aria-label="Search FAQs input"
            />
          </div>

          <div className="md:col-span-5 flex bg-slate-900/40 border border-white/5 rounded-xl p-1 backdrop-blur-md">
            {['all', 'usage', 'audio', 'limits'].map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIdx(null); }}
                className={`flex-1 text-[11px] uppercase font-bold py-2 rounded-lg transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/5 bg-slate-950/20 overflow-hidden backdrop-blur-md hover:border-cyan-500/10 transition"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-slate-200 hover:text-white transition font-bold text-sm"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <BiChevronDown
                    className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-xs font-medium text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center text-xs text-slate-500 py-10 font-medium">
              No matching questions found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
