import { motion } from 'framer-motion';

const sample = [
  { from: '🇺🇸', a: 'English', to: '🇪🇸', b: 'Spanish' },
  { from: '🇮🇳', a: 'Telugu', to: '🇫🇷', b: 'French' },
  { from: '🇩🇪', a: 'German', to: '🇯🇵', b: 'Japanese' },
  { from: '🇨🇳', a: 'Chinese', to: '🇺🇸', b: 'English' },
];

export default function FloatingLanguageCards() {
  return (
    <div className="floating-cards absolute inset-0 flex items-center justify-center pointer-events-none">
      {sample.map((s, i) => (
        <motion.div
          key={i}
          className="floating-card glass-card p-3 px-4 mx-3 flex items-center gap-3"
          animate={{ y: [0, -18, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          style={{ zIndex: 30 }}
        >
          <div className="text-2xl">{s.from}</div>
          <div className="flex flex-col text-left">
            <div className="text-sm text-slate-200 font-semibold">{s.a}</div>
            <div className="text-xs text-slate-400">→ {s.b}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
