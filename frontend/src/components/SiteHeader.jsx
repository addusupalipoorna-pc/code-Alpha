import { useEffect, useState } from 'react';
import LogoSrc from '../assets/logo.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { BiMenu, BiX } from 'react-icons/bi';

const links = [
  { label: 'Translate', href: '#translator' },
  { label: 'Features', href: '#features' },
  { label: 'Sign in', href: '#/signin' },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 md:px-8 ${
          scrolled
            ? 'py-3 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand/Logo */}
          <a href="#" className="flex items-center gap-3 select-none group" aria-label="Code Alpha home">
            <div className="relative">
              <img src={LogoSrc} alt="" className="h-8 w-8 relative z-10 transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="flex flex-col text-left">
              <span className="text-base font-extrabold text-white tracking-wide leading-none">Code Alpha</span>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest mt-0.5">AI Translator</span>
            </span>
          </a>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors duration-200 relative py-1"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#/signup"
              className="text-xs uppercase font-extrabold px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Get started
            </a>
          </nav>

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-200 hover:text-cyan-400 transition-colors"
            aria-label="Open navigation menu"
          >
            <BiMenu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Spacer to push content down so header doesn't overlap */}
      <div className="h-16" />

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[999] flex flex-col p-6"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-extrabold text-white">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-200 hover:text-cyan-400"
                aria-label="Close navigation menu"
              >
                <BiX className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-6" aria-label="Mobile navigation">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-semibold text-slate-200 hover:text-cyan-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-center py-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white mt-4"
              >
                Get started
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
