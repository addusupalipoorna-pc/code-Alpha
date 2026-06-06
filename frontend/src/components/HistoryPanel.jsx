import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { BiTrash, BiDownload } from 'react-icons/bi';

export default function HistoryPanel({ history, setHistory }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return history.filter((item) =>
      item.sourceText.toLowerCase().includes(lower) ||
      item.translatedText.toLowerCase().includes(lower) ||
      item.sourceLang.toLowerCase().includes(lower) ||
      item.targetLang.toLowerCase().includes(lower)
    );
  }, [history, searchTerm]);

  const removeItem = (id) => {
    setHistory(history.filter((item) => item.id !== id));
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border border-white/10 p-6 shadow-glass"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-sky-300/70">History</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-50">Translation Activity</h3>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <button aria-label="Clear all history" onClick={() => setHistory([])} className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-200 transition hover:bg-red-500/15 btn btn-micro">
            <BiTrash className="inline-block h-4 w-4" /> Clear all
          </button>
          <button aria-label="Export history as CSV" onClick={exportHistory} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-200 transition hover:bg-cyan-500/15 btn btn-micro">
            <BiDownload className="inline-block h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>
      <div className="mb-5 rounded-3xl border border-slate-700 bg-slate-900/80 p-4">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            aria-label="Search history"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search history, source, or target languages"
            className="w-full rounded-3xl border border-slate-700 bg-slate-950/90 py-3 pl-12 pr-4 text-slate-100 outline-none transition focus:border-cyan-400/60"
          />
        </div>
      </div>
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/80 p-8 text-center text-slate-400">
            No translations yet. Start typing to capture your first entry.
          </div>
        ) : (
          filteredHistory.slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.25em] text-slate-500">
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <span>{item.sourceLang.toUpperCase()} → {item.targetLang.toUpperCase()}</span>
              </div>
              <p className="text-slate-200">{item.sourceText}</p>
              <div className="my-3 h-px bg-slate-800/80" />
              <p className="text-slate-100">{item.translatedText}</p>
              <button
                aria-label={`Remove history item from ${new Date(item.createdAt).toLocaleString()}`}
                onClick={() => removeItem(item.id)}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10 btn btn-micro"
              >
                <BiTrash className="h-4 w-4" /> Remove
              </button>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
}
