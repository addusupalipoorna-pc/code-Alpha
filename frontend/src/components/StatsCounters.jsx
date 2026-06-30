import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function useInView(ref, rootMargin = '0px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setInView(true); });
    }, { root: null, rootMargin, threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

export default function StatsCounters({ items = [] }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, '0px');

  const defaultItems = [
    { label: 'Supported Languages', value: '100+' },
    { label: 'Translations Cleared', value: '50000+' },
    { label: 'Translation Accuracy', value: '99.8%' },
    { label: 'System Uptime', value: '24/7' }
  ];

  const activeItems = items && items.length > 0 ? items : defaultItems;

  return (
    <div ref={containerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 w-full">
      {activeItems.map((it, idx) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
        >
          <Stat label={it.label} value={it.value} inView={inView} />
        </motion.div>
      ))}
    </div>
  );
}

function Stat({ label, value, inView }) {
  const [num, setNum] = useState(0);
  const rafRef = useRef(null);

  const cleanVal = String(value).replace(/[^0-9.]/g, '');
  const parsedVal = parseFloat(cleanVal) || 0;
  const isFloat = String(value).includes('.');

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const start = performance.now();
    const from = 0;
    const to = parsedVal;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // quintic ease out for super smooth final decelerations
      const eased = 1 - Math.pow(1 - t, 5);
      const val = from + (to - from) * eased;
      setNum(isFloat ? parseFloat(val.toFixed(1)) : Math.floor(val));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, parsedVal, isFloat]);

  // Extract non-digits to append (e.g. +, %, /7)
  const suffix = String(value).replace(/[0-9.]/g, '');

  return (
    <div className="glass-card p-6 text-center rounded-2xl border border-white/5 bg-slate-950/30 relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
      {/* Ambient background glow inside cards */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative z-10">
        <h4 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-violet-400 drop-shadow-md select-none">
          {num}
          <span className="text-cyan-400 font-bold ml-0.5">{suffix}</span>
        </h4>
        <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mt-2 select-none group-hover:text-slate-300 transition-colors">
          {label}
        </p>
      </div>
    </div>
  );
}
