import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingTexts = [
  { text: 'Initializing AI Engine...', max: 20 },
  { text: 'Loading Translation Models...', max: 45 },
  { text: 'Preparing Neural Network...', max: 70 },
  { text: 'Optimizing AI...', max: 90 },
  { text: 'Almost Ready...', max: 100 },
];

export default function PageLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [activeText, setActiveText] = useState(loadingTexts[0].text);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const start = Date.now();
    const duration = 2400; // 2.4 seconds loading sequence

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      const match = loadingTexts.find((t) => pct <= t.max);
      if (match) {
        setActiveText(match.text);
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
          if (onComplete) onComplete();
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-[#050614] z-[99999] flex flex-col items-center justify-center select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
        >
          {/* Background glowing blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[90px] animate-orb-drift-1" />
            <div className="absolute bottom-[20%] right-[25%] w-[450px] h-[450px] rounded-full bg-cyan-600/10 blur-[100px] animate-orb-drift-2" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
            {/* Pulsing AI Brain Vector Icon */}
            <svg
              className="brain-loader-svg w-24 h-24 text-cyan-400 mb-8"
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22c0-5.5 4.5-10 10-10h1v20h-1c-5.5 0-10-4.5-10-10z" />
              <path d="M52 22c0-5.5-4.5-10-10-10h-1v20h1c5.5 0 10-4.5 10-10z" />
              <path d="M23 16c2-4 6-6 9-6s7 2 9 6" />
              <path d="M23 28c2 4 6 6 9 6s7-2 9-6" />
              <path d="M32 10v24" />
              <path d="M32 34c0 6-4 12-10 12h-1v6h1c7.7 0 14-6.3 14-14z" />
              <path d="M32 34c0 6 4 12 10 12h1v6h-1c-7.7 0-14-6.3-14-14z" />
              <circle cx="23" cy="22" r="1.5" fill="currentColor" />
              <circle cx="41" cy="22" r="1.5" fill="currentColor" />
            </svg>

            {/* Title / Logo */}
            <h2 className="text-xl font-extrabold tracking-wider text-slate-100 mb-1">
              CODE ALPHA
            </h2>
            <p className="text-xs uppercase font-semibold text-cyan-400/80 tracking-widest mb-6">
              NEURAL TRANSLATOR
            </p>

            {/* Active Loading Text */}
            <div className="h-6 mb-4">
              <motion.p
                key={activeText}
                className="text-sm text-slate-300 font-medium"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeText}
              </motion.p>
            </div>

            {/* Progress Container */}
            <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-bold mt-2 tracking-wider">
              {progress}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
