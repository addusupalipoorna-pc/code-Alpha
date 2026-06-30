import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { BiTrash, BiDownload, BiStar, BiSolidStar, BiPin, BiShareAlt } from 'react-icons/bi';

export default function HistoryPanel({ history = [], setHistory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'favorites' | 'pinned'

  const filteredHistory = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    let result = history.filter((item) =>
      item.sourceText.toLowerCase().includes(lower) ||
      item.translatedText.toLowerCase().includes(lower) ||
      item.sourceLang.toLowerCase().includes(lower) ||
      item.targetLang.toLowerCase().includes(lower)
    );

    if (activeFilter === 'favorites') {
      result = result.filter((item) => item.isFavorite);
    } else if (activeFilter === 'pinned') {
      result = result.filter((item) => item.isPinned);
    }

    // Sort: pinned first, then newest
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [history, searchTerm, activeFilter]);

  const removeItem = (id) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  const toggleFavorite = (id) => {
    setHistory(
      history.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const togglePin = (id) => {
    setHistory(
      history.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  const exportHistory = () => {
    const content = filteredHistory
      .map((item) => `${item.createdAt},${item.sourceLang},${item.targetLang},"${item.sourceText}","${item.translatedText}"`)
      .join('\n');
    const blob = new Blob([`date,source,target,original,translation\n${content}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'translation-history.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <motion.section
      className="history-section mt-12 py-10 px-4 md:px-8 bg-slate-950/20 border border-white/5 rounded-3xl backdrop-blur-md"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs uppercase font-extrabold text-cyan-400 tracking-widest">History</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">Translation Activity</h2>
          <p className="text-sm text-slate-400 mt-1">
            Review and manage your localized translations log timeline.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            onClick={() => setHistory([])}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/10 hover:border-red-500/20 bg-red-500/10 text-xs font-bold text-red-200 transition"
            aria-label="Clear all history"
          >
            <BiTrash /> Clear all
          </button>
          <button
            onClick={exportHistory}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 hover:border-cyan-500/20 bg-slate-900 text-xs font-bold text-slate-300 transition"
            aria-label="Export history as CSV"
          >
            <BiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toggles & Search Bar */}
      <div className="grid gap-4 md:grid-cols-12 mb-8 items-center">
        <div className="md:col-span-8 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4.5 w-4.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs, keywords, languages..."
            className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs font-medium text-slate-200 outline-none focus:border-cyan-500/30 transition placeholder-slate-600"
            aria-label="Search logs input"
          />
        </div>

        <div className="md:col-span-4 flex bg-slate-900/40 border border-white/5 rounded-xl p-1 backdrop-blur-md">
          {['all', 'favorites', 'pinned'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 text-[11px] uppercase font-bold py-2 rounded-lg transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-white/5 pl-6 ml-3 space-y-6">
        <AnimatePresence initial={false}>
          {filteredHistory.map((item, idx) => (
            <motion.div
              key={item.id}
              className="relative p-5 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-md hover:border-cyan-500/10 transition-colors"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3 }}
            >
              {/* Timeline dot */}
              <div className="absolute -left-[31px] top-6 w-2.5 h-2.5 rounded-full bg-slate-900 border border-cyan-400 shadow-[0_0_8px_#22d3ee]" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                  {item.isPinned && (
                    <span className="flex items-center gap-0.5 text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      <BiPin /> Pinned
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] uppercase font-bold text-slate-400 border border-white/5">
                    {item.sourceLang.toUpperCase()} → {item.targetLang.toUpperCase()}
                  </span>
                  
                  {/* Pin, Fav, Remove controls */}
                  <button
                    onClick={() => togglePin(item.id)}
                    className={`p-1.5 rounded-lg border transition ${
                      item.isPinned
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                        : 'border-white/5 text-slate-500 hover:text-slate-200'
                    }`}
                    aria-label="Pin log entry"
                  >
                    <BiPin className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`p-1.5 rounded-lg border transition ${
                      item.isFavorite
                        ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                        : 'border-white/5 text-slate-500 hover:text-slate-200'
                    }`}
                    aria-label="Favorite log entry"
                  >
                    {item.isFavorite ? <BiSolidStar className="h-4 w-4" /> : <BiStar className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg border border-white/5 text-slate-500 hover:text-red-400 hover:border-red-500/20 transition"
                    aria-label="Delete entry"
                  >
                    <BiTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Source Text */}
              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                {item.sourceText}
              </p>

              {/* Connector Separator */}
              <div className="my-3 flex items-center gap-2">
                <div className="h-px bg-white/5 flex-1" />
                <span className="text-[9px] uppercase font-extrabold text-slate-600 tracking-wider">AI translation</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              {/* Translation Output */}
              <p className="text-slate-100 text-sm leading-relaxed font-bold">
                {item.translatedText}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredHistory.length === 0 && (
          <div className="text-center text-xs text-slate-500 py-12 font-medium border border-dashed border-white/5 rounded-2xl bg-slate-950/20">
            No translations found. Start typing above to log your queries.
          </div>
        )}
      </div>
    </motion.section>
  );
}
