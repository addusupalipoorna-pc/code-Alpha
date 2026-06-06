import { useEffect, useRef, useState } from 'react';

export default function LazyLoadGlobe({ importFunc, placeholder }) {
  const ref = useRef(null);
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let obs;
    const onIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // import the component dynamically when in view
          importFunc().then((m) => setComponent(() => m.default || m));
          if (obs) obs.disconnect();
        }
      });
    };
    obs = new IntersectionObserver(onIntersect, { root: null, threshold: 0.25 });
    obs.observe(el);
    return () => obs && obs.disconnect();
  }, [importFunc]);

  return (
    <div ref={ref}>
      {Component ? <Component /> : (placeholder || <div className="glass-card p-6">Loading globe…</div>)}
    </div>
  );
}
