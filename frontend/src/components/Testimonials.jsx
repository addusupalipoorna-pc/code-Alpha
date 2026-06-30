import { useState } from 'react';
import { motion } from 'framer-motion';
import { BiSolidStar } from 'react-icons/bi';

const testimonials = [
  { name: 'Sarah Jenkins', role: 'Head of Product, Vercel', rating: 5, text: 'Translation quality is stunning. We ship global localized content 10x faster now.', avatar: 'SJ' },
  { name: 'Liam Kovalenko', role: 'Senior Developer, ElevenLabs', rating: 5, text: 'Real-time translation and cross-browser dictation features saved our team countless hours.', avatar: 'LK' },
  { name: 'Dr. Michael Chen', role: 'AI Engineering Lead, DeepL', rating: 5, text: 'The offline cybernetic 3D globe visualization and context scoring models are next level.', avatar: 'MC' },
  { name: 'Asha Rao', role: 'Localization Specialist, Stripe', rating: 5, text: 'Clean API documentation and robust PDF export formats made integration a breeze.', avatar: 'AR' },
  { name: 'Elena Rostova', role: 'Global Content Director, Notion', rating: 5, text: 'Its accessibility focus and timing-safe audio synthesis work flawlessly in all browsers.', avatar: 'ER' }
];

export default function Testimonials() {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate list to achieve seamless infinite loop
  const list = [...testimonials, ...testimonials];

  return (
    <div
      className="relative w-full overflow-hidden py-10 select-none"
      role="region"
      aria-label="User testimonials marquee"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left and Right blur overlays for infinite fade edge look */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#03030d] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#03030d] to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-6 w-max"
        style={{
          animation: 'marquee 30s linear infinite',
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {list.map((item, idx) => (
          <div
            key={`${item.name}-${idx}`}
            className="w-80 p-6 rounded-2xl border border-white/5 bg-slate-950/40 backdrop-blur-md hover:border-cyan-500/20 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Star Rating */}
              <div className="flex gap-1 mb-4 text-cyan-400">
                {[...Array(item.rating)].map((_, i) => (
                  <BiSolidStar key={i} className="h-4 w-4" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                “{item.text}”
              </p>
            </div>

            <div className="flex items-center gap-3 mt-6 border-t border-white/5 pt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-inner select-none">
                {item.avatar}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">{item.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Style tag injected for marquee keyframe animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
