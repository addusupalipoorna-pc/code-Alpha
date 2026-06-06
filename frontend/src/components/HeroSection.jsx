import { useEffect, useRef, useState } from 'react';
import LogoSrc from '../assets/logo.svg';
import languages from '../assets/languages';
import AnimatedBackground from './AnimatedBackground';
import FloatingLanguageCards from './FloatingLanguageCards';
import LanguagesCarousel from './LanguagesCarousel.jsx';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4';

function Nav() {
  return (
    <div className="hero-navbar">
      <div className="flex items-center gap-4">
        <img src={LogoSrc} alt="Code Alpha logo" style={{ height: 32 }} />
      </div>
      {/* nav items removed per request */}
    </div>
  );
}

export default function HeroSection() {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let rafId = null;
    let start = null;

    const fade = (from, to, duration) => {
      cancelAnimationFrame(rafId);
      start = null;
      return new Promise((resolve) => {
        const step = (ts) => {
          if (!start) start = ts;
          const elapsed = ts - start;
          const t = Math.min(1, elapsed / duration);
          const val = from + (to - from) * t;
          v.style.opacity = String(val);
          if (t < 1) {
            rafId = requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        rafId = requestAnimationFrame(step);
      });
    };

    const playWithFade = async () => {
      try {
        v.currentTime = 0;
      } catch (e) {}
      // fade-in 0.5s
      await fade(0, 1, 500);
      try { await v.play(); } catch (e) {}
    };

    v.addEventListener('loadedmetadata', () => {
      v.style.opacity = '0';
      playWithFade();
    });

    v.addEventListener('ended', async () => {
      // fade-out 0.5s then reset to 0, wait 100ms and replay
      await fade(1, 0, 500);
      v.style.opacity = '0';
      setTimeout(() => {
        try { v.currentTime = 0; v.play(); } catch (e) {}
      }, 100);
    });

    // start attempt (in case metadata already loaded)
    if (v.readyState >= 2) {
      playWithFade();
    }

    return () => cancelAnimationFrame(rafId);
  }, []);

  const langs = languages.map((l) => l.name).filter(Boolean);

  const rotatingWords = ['English','Spanish','Telugu','Hindi','French','German','Japanese','Arabic','Chinese'];
  const [typedText, setTypedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout;
    const current = rotatingWords[wordIndex] || '';
    if (charIndex <= current.length) {
      setTypedText(current.slice(0, charIndex));
      timeout = setTimeout(() => setCharIndex((c) => c + 1), 100);
    } else {
      // pause then move to next word
      timeout = setTimeout(() => {
        setCharIndex(0);
        setWordIndex((w) => (w + 1) % rotatingWords.length);
      }, 1200);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, wordIndex]);

  return (
    <header className="hero-section">
      <video ref={videoRef} className="hero-video" muted playsInline src={VIDEO_URL} />

      <div className="hero-blur-shape" aria-hidden />
      <AnimatedBackground />
      <FloatingLanguageCards />

      <Nav />
      <div className="nav-divider" />

      <div className="hero-content max-w-4xl mx-auto text-center py-20">
        <h1 className="hero-headline text-5xl md:text-6xl font-extrabold leading-tight">
          Translate the World with AI
          <span className="block mt-4 text-3xl md:text-4xl font-semibold" style={{ background: 'linear-gradient(90deg,#22d3ee,#7c3aed,#60a5fa)', WebkitBackgroundClip: 'text', color: 'transparent', textShadow: '0 6px 30px rgba(124,58,237,0.12)' }}>
            <span id="rotating-word" style={{ textShadow: '0 8px 28px rgba(96,165,250,0.08)' }}>{typedText}</span>
            <span className="ml-2 text-cyan-300" id="typing-cursor">|</span>
          </span>
        </h1>

        <p className="hero-sub mt-6 text-lg text-slate-300">
          Break language barriers instantly with AI-powered translation supporting 100+ languages, voice recognition, speech synthesis, document translation, and real-time communication.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 justify-center items-center">
          <a href="#translator" aria-label="Start Translating" className="hero-cta-primary btn btn-micro">
            Start Translating
          </a>
          <a href="#features" aria-label="Explore features" className="hero-cta-secondary btn btn-micro">
            Explore features
          </a>
        </div>
      </div>

      <div className="marquee-wrap">
        <div className="marquee-inner">
          <div className="text-sm" style={{ color: 'hsl(var(--fg-h) var(--fg-s) calc(var(--fg-l) * 0.5))' }}>Supported languages</div>
          <div className="brand-marquee">
            <div className="marquee-track" aria-hidden>
              {langs.concat(langs).map((b, i) => (
                <div className="brand-item" key={`${b}-${i}`}>
                  <div className="liquid-glass brand-logo" style={{ background: 'rgba(255,255,255,0.02)' }}>{b[0]}</div>
                  <div style={{ fontWeight: 600 }}>{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Languages carousel (flags & visual) */}
      <div className="max-w-6xl mx-auto px-6">
        <LanguagesCarousel />
      </div>
    </header>
  );
}
 
