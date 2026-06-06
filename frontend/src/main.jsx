import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// Smooth scroll: prefer native behavior; Lenis removed to avoid build-time resolution issues.
// If you want Lenis back, add the correct package and dynamic import.

// Global ripple effect for buttons having the 'ripple' class
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    const target = e.target.closest && e.target.closest('.ripple');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.className = 'ripple-effect';
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, { passive: true });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
