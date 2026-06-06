import { useEffect } from 'react';

export default function AnimatedBackground() {
  useEffect(() => {
    // simple particle creation for ambient motion (non-critical, purely visual)
    const root = document.querySelector('.animated-bg-root');
    if (!root) return;
    const particles = [];
    for (let i = 0; i < 18; i += 1) {
      const el = document.createElement('div');
      el.className = 'bg-particle';
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 100}%`;
      el.style.width = `${40 + Math.random() * 120}px`;
      el.style.height = el.style.width;
      el.style.opacity = `${0.03 + Math.random() * 0.06}`;
      root.appendChild(el);
      particles.push(el);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <div aria-hidden className="animated-bg-root pointer-events-none absolute inset-0 -z-10">
      <div className="gradient-blob left-blob" />
      <div className="gradient-blob right-blob" />
    </div>
  );
}
