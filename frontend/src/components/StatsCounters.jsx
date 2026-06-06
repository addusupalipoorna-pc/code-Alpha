import { useEffect, useRef, useState } from 'react';

function useInView(ref, rootMargin = '0px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setInView(true); });
    }, { root: null, rootMargin, threshold: 0.2 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

export default function StatsCounters({ items = [] }) {
  const containerRef = useRef(null);
  const inView = useInView(containerRef, '0px');

  return (
    <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-4 gap-6 reveal">
      {items.map((it) => (
        <Stat key={it.label} label={it.label} value={it.value} inView={inView} />
      ))}
    </div>
  );
}

function Stat({ label, value, inView }) {
  const [num, setNum] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    const from = 0;
    const to = Number(value.toString().replace(/[^0-9]/g, '')) || Number(value);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setNum(Math.floor(from + (to - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, value]);

  return (
    <div className="glass-card p-4 text-center">
      <div className="text-3xl font-bold text-slate-100">{num}{typeof value === 'string' && value.match(/\D+/) ? value.replace(/\d+/,'') : '+'}</div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}
