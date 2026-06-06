import { useEffect, useRef } from 'react';
import languages from '../assets/languages.js';

export default function LanguagesCarousel() {
  const trackRef = useRef(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let req;
    let offset = 0;
    const step = () => {
      offset -= 0.2;
      if (offset <= -100) offset = 0;
      el.style.transform = `translateX(${offset}%)`;
      req = requestAnimationFrame(step);
    };
    req = requestAnimationFrame(step);
    return () => cancelAnimationFrame(req);
  }, []);

  // pick a subset or all langs if available
  const items = languages.slice(0, 40).map((l) => ({ code: l.code, name: l.name, native: l.native || l.name }));

  return (
    <div className="languages-carousel mt-6 w-full overflow-hidden">
      <div className="languages-track flex gap-4" ref={trackRef} aria-hidden>
        {items.concat(items).map((it, i) => (
          <div key={`${it.code}-${i}`} className="lang-card glass-card px-4 py-3 flex items-center gap-3">
            <div className="flag" style={{ fontSize: 20 }}>{it.code === 'en' ? '🇺🇸' : it.code === 'te' ? '🇮🇳' : it.code === 'es' ? '🇪🇸' : '🏳️'}</div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{it.name}</span>
              <span className="text-xs text-slate-400">{it.native}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
