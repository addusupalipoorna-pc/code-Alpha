import { useState } from 'react';

export default function GlobeLoader({ importFunc, placeholder, ...props }) {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    if (Component) return;
    setLoading(true);
    try {
      const m = await importFunc();
      setComponent(() => m.default || m);
    } catch (e) {
      // fail silently — keep placeholder
      // console.error('Failed to load globe', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 rounded-xl">
      {Component ? (
        <Component {...props} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          {placeholder || (
            <svg width="220" height="120" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect width="220" height="120" rx="12" fill="#0f172a" />
              <g opacity="0.9" transform="translate(24,18)">
                <circle cx="46" cy="42" r="36" stroke="#94a3b8" strokeWidth="1.5" fill="#071024" />
                <path d="M10 42c10-18 72-26 108-10" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </svg>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleLoad}
              className="btn btn-primary px-4 py-2 rounded focus:outline-none focus:ring"
              aria-label="Load interactive 3D globe"
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Load 3D Globe'}
            </button>
            <button
              onClick={() => window.scrollTo({ top: window.scrollY + 200, behavior: 'smooth' })}
              className="btn px-3 py-2 rounded bg-slate-800 text-slate-200"
            >
              Preview image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
