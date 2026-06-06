import { useEffect } from 'react';
import { FiMic, FiShield, FiVolume2, FiRepeat, FiFileText, FiClock, FiList, FiCloud } from 'react-icons/fi';

export default function Features() {
  const features = [
    { title: 'Voice Translation', icon: FiMic },
    { title: 'AI Accuracy Engine', icon: FiShield },
    { title: 'Text To Speech', icon: FiVolume2 },
    { title: 'Speech To Text', icon: FiRepeat },
    { title: 'PDF Translation', icon: FiFileText },
    { title: 'Real-Time Translation', icon: FiClock },
    { title: 'Translation History', icon: FiList },
    { title: 'Cloud Sync', icon: FiCloud },
  ];

  useEffect(() => {
    // GSAP handles reveal animations; nothing required here
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <div key={f.title} className="feature-card reveal glass-card p-5" data-magnetic="28" role="article" aria-label={f.title} tabIndex={0} style={{ transitionDelay: `${i * 70}ms` }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))' }}>
                <Icon className="text-cyan-200" size={20} aria-hidden />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-100">{f.title}</div>
                <p className="mt-1 text-sm text-slate-400">Enterprise-grade {f.title.toLowerCase()} for production workflows.</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
