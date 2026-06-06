import { useEffect, useRef, useState } from 'react';

const sample = [
  { name: 'Asha R.', role: 'Product Manager', rating: 5, text: 'Translation quality is excellent — we ship global content faster.' },
  { name: 'Liam K.', role: 'Developer', rating: 5, text: 'Real-time translation and speech features saved us hours.' },
  { name: 'Maria S.', role: 'Localization Lead', rating: 5, text: 'API and export tools are robust and accurate.' },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % sample.length), 4200);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="testimonials reveal" role="region" aria-label="User testimonials">
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-xl">{sample[index].name.split(' ')[0][0]}</div>
          <div>
            <div className="font-semibold text-slate-100">{sample[index].name}</div>
            <div className="text-xs text-slate-400">{sample[index].role}</div>
          </div>
        </div>
        <p className="mt-4 text-slate-200">“{sample[index].text}”</p>
      </div>
      <div className="mt-4 flex gap-2">
        {sample.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            aria-pressed={i === index}
            className={`w-2 h-2 rounded-full ${i === index ? 'bg-cyan-400' : 'bg-slate-700'}`}
          />
        ))}
      </div>
    </div>
  );
}
