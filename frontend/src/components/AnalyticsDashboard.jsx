import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard({ history }) {
  const metrics = useMemo(() => {
    const total = history.length;
    const languages = history.reduce((acc, item) => {
      acc[item.targetLang] = (acc[item.targetLang] || 0) + 1;
      return acc;
    }, {});
    const mostUsed = Object.entries(languages).sort((a, b) => b[1] - a[1])[0] || ['en', 0];
    return {
      total,
      uniqueLanguages: Object.keys(languages).length,
      mostUsedLanguage: `${mostUsed[0].toUpperCase()} (${mostUsed[1]})`,
      weekly: [
        { label: 'Mon', value: 4 },
        { label: 'Tue', value: 7 },
        { label: 'Wed', value: 3 },
        { label: 'Thu', value: 8 },
        { label: 'Fri', value: 6 },
        { label: 'Sat', value: 10 },
        { label: 'Sun', value: 5 },
      ],
    };
  }, [history]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border border-white/10 p-6 shadow-glass"
    >
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-fuchsia-300/80">Analytics</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-50">Workspace insights</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-700 bg-slate-950/80 p-5">
          <p className="text-sm text-slate-400">Total translations</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">{metrics.total}</p>
        </div>
        <div className="rounded-[2rem] border border-slate-700 bg-slate-950/80 p-5">
          <p className="text-sm text-slate-400">Languages translated</p>
          <p className="mt-3 text-3xl font-semibold text-slate-50">{metrics.uniqueLanguages}</p>
        </div>
      </div>
      <div className="mt-5 rounded-[2rem] border border-slate-700 bg-slate-950/80 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Most translated target</p>
          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300">Live</span>
        </div>
        <p className="mt-3 text-xl font-semibold text-slate-50">{metrics.mostUsedLanguage}</p>
      </div>
      <div className="mt-6 rounded-[2rem] border border-slate-700 bg-slate-950/80 p-5">
        <p className="text-sm text-slate-400">Weekly translation activity</p>
        <div className="mt-5 space-y-4">
          {metrics.weekly.map((point) => (
            <div key={point.label} className="flex items-center gap-4 text-sm text-slate-300">
              <span className="w-12">{point.label}</span>
              <div className="h-3 flex-1 rounded-full bg-slate-900">
                <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" style={{ width: `${point.value * 8 + 20}%` }} />
              </div>
              <span className="w-10 text-right text-slate-100">{point.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
