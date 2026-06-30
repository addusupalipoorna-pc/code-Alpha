import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSearch, BiCheck, BiTime } from 'react-icons/bi';
import languages from '../assets/languages';

export default function CommandPalettePicker({ value, onChange, excludeAuto = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents, setRecents] = useState(['en', 'es', 'fr']); // default recents

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedLang = languages.find((l) => l.code === value) || languages[0];

  const filtered = languages.filter((lang) => {
    if (excludeAuto && lang.code === 'auto') return false;
    const q = search.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.native.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  // Track key events for navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIndex]) {
          selectLang(filtered[activeIndex].code);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filtered]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectLang = (code) => {
    onChange(code);
    setIsOpen(false);
    setSearch('');
    // Update recents
    if (code !== 'auto') {
      setRecents((prev) => {
        const next = [code, ...prev.filter((c) => c !== code)];
        return next.slice(0, 3);
      });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/80 hover:bg-slate-900 hover:border-cyan-500/30 text-slate-200 text-xs font-semibold select-none transition-all duration-150 shadow-inner"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{selectedLang.flag}</span>
        <span>{selectedLang.name}</span>
        <span className="text-[10px] text-slate-500">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-72 bg-slate-950/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl z-50 flex flex-col max-h-80"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-slate-900/40">
              <BiSearch className="text-slate-400 h-4 w-4 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search languages..."
                className="bg-transparent border-none text-slate-200 text-xs w-full focus:outline-none placeholder-slate-500"
              />
            </div>

            <div className="overflow-y-auto flex-1 p-1 scrollbar-thin scrollbar-thumb-white/10">
              {/* Recents Section */}
              {search === '' && (
                <div className="mb-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <BiTime />
                    <span>Recent</span>
                  </div>
                  {recents.map((code) => {
                    const l = languages.find((lang) => lang.code === code);
                    if (!l) return null;
                    return (
                      <button
                        key={`recent-${code}`}
                        type="button"
                        onClick={() => selectLang(code)}
                        className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-100"
                      >
                        <span>{l.flag}</span>
                        <span className="flex-1">{l.name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{l.code}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* All / Filtered Languages Section */}
              <div>
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Languages
                </div>
                {filtered.map((lang, idx) => {
                  const isActive = idx === activeIndex;
                  const isSelected = lang.code === value;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => selectLang(lang.code)}
                      className={`flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all duration-100 ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600/30 to-cyan-500/10 text-cyan-300'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-sm leading-none">{lang.flag}</span>
                      <span className="flex-1 font-medium">{lang.name}</span>
                      {isSelected && <BiCheck className="text-cyan-400 h-4 w-4" />}
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{lang.code}</span>
                    </button>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="text-center text-xs text-slate-500 py-6 font-medium">
                    No languages found
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
