import { motion } from 'framer-motion';
import { FiMic, FiShield, FiVolume2, FiRepeat, FiFileText, FiClock, FiList, FiCloud } from 'react-icons/fi';

const features = [
  { title: 'Voice Translation', icon: FiMic, desc: 'Enterprise-grade voice translation for production workflows.' },
  { title: 'AI Accuracy Engine', icon: FiShield, desc: 'Self-correcting AI accuracy engine for semantic alignment.' },
  { title: 'Text To Speech', icon: FiVolume2, desc: 'High-fidelity natural speech synthesis in 100+ locales.' },
  { title: 'Speech To Text', icon: FiRepeat, desc: 'Cross-browser recording with automatic background transcription.' },
  { title: 'PDF Translation', icon: FiFileText, desc: 'Compile translations directly into formatted PDF reports.' },
  { title: 'Real-Time Translation', icon: FiClock, desc: 'Translates as you type with instant debounced updates.' },
  { title: 'Translation History', icon: FiList, desc: 'Interactive history log with timeline filters and favoriting.' },
  { title: 'Cloud Sync', icon: FiCloud, desc: 'Sync settings and translation logs securely to the cloud.' },
];

export default function Features() {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div id="features" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-12">
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <motion.div
            key={f.title}
            className="feature-card card-glow-border p-6 rounded-2xl bg-slate-950/40 border border-white/5 backdrop-blur-md relative overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            role="article"
            aria-label={f.title}
            tabIndex={0}
          >
            {/* Ambient hover light effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex flex-col gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900 border border-white/10 group-hover:border-cyan-500/30 transition-colors duration-300">
                <Icon className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" size={22} aria-hidden />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors duration-200">{f.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
