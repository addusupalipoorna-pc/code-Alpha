import { useEffect, useRef, useState } from 'react';
import LogoSrc from '../assets/logo.svg';
import languages from '../assets/languages';
import AnimatedBackground from './AnimatedBackground';
import {
  NeuralMeshBackground,
  FluidOrbsBackground,
  CyberneticGlobeBackground,
  PrismaticLightBackground
} from './InteractiveBackgrounds';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4';

function Nav({ bgTheme, setBgTheme }) {
  const themes = [
    { id: 'video', label: 'Video' },
    { id: 'mesh', label: 'Mesh' },
    { id: 'orbs', label: 'Orbs' },
    { id: 'globe', label: 'Globe' },
    { id: 'prismatic', label: 'Prism' },
  ];

  return (
    <div className="flex items-center gap-1.5 bg-slate-950/40 border border-white/5 rounded-full p-1.5 backdrop-blur-md self-center">
      <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-widest">Theme:</span>
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setBgTheme(t.id)}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-all duration-200 ${
            bgTheme === t.id
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function HeroSection() {
  const videoRef = useRef(null);
  const [bgTheme, setBgTheme] = useState('video');

  useEffect(() => {
    if (bgTheme !== 'video') return;
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
      await fade(0, 1, 500);
      try { await v.play(); } catch (e) {}
    };

    v.addEventListener('loadedmetadata', () => {
      v.style.opacity = '0';
      playWithFade();
    });

    v.addEventListener('ended', async () => {
      await fade(1, 0, 500);
      v.style.opacity = '0';
      setTimeout(() => {
        try { v.currentTime = 0; v.play(); } catch (e) {}
      }, 100);
    });

    if (v.readyState >= 2) {
      playWithFade();
    }

    return () => cancelAnimationFrame(rafId);
  }, [bgTheme]);

  const rotatingWords = [
    'English', 'Spanish', 'French', 'German', 'Hindi',
    'Japanese', 'Chinese', 'Arabic', 'Russian', 'Italian',
    'Portuguese', 'Tamil', 'Telugu', 'Kannada', 'Malayalam',
    'Gujarati', 'Punjabi', 'Bengali'
  ];

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
      timeout = setTimeout(() => {
        setCharIndex(0);
        setWordIndex((w) => (w + 1) % rotatingWords.length);
      }, 1400);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, wordIndex]);

  return (
    <header className="hero-section select-none relative overflow-hidden min-h-[85vh] flex flex-col justify-center py-20 text-center">
      {/* Background Visual themes */}
      {bgTheme === 'video' && <video ref={videoRef} className="hero-video" muted playsInline src={VIDEO_URL} />}
      {bgTheme === 'mesh' && <NeuralMeshBackground />}
      {bgTheme === 'orbs' && <FluidOrbsBackground />}
      {bgTheme === 'globe' && <CyberneticGlobeBackground />}
      {bgTheme === 'prismatic' && <PrismaticLightBackground />}

      <div className="hero-blur-shape" aria-hidden />
      <AnimatedBackground />

      <div className="hero-content w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 flex flex-col items-center space-y-8">
        <Nav bgTheme={bgTheme} setBgTheme={setBgTheme} />

        <h1 className="hero-headline text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight text-white tracking-tight">
          Translate the World with <br />
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-indigo-500">
            AI Powered Precision
          </span>
          <span className="block mt-4 text-xl sm:text-2xl md:text-3xl font-semibold text-slate-300">
            Speak in <span className="text-cyan-400">{typedText}</span>
            <span className="text-cyan-400 animate-pulse ml-0.5" id="typing-cursor">|</span>
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          Break language barriers instantly with our enterprise-grade neural translation suite. Real-time translation, cross-browser speech recognition, and instant document transcription at your fingertips.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <a
            href="#translator"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-violet-500/10 hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 group"
          >
            Start Translating
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <a
            href="#features"
            className="px-8 py-3.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-slate-200 font-bold text-sm tracking-wide hover:bg-slate-900 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Explore Features
          </a>
        </div>
      </div>
    </header>
  );
}
