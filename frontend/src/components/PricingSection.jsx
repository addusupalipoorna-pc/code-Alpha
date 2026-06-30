import { useState } from 'react';
import { motion } from 'framer-motion';
import { BiCheck } from 'react-icons/bi';

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'yearly'

  const tiers = [
    {
      name: 'Free',
      desc: 'Essential translation tools for personal projects.',
      price: billingPeriod === 'monthly' ? '$0' : '$0',
      period: '/mo',
      features: [
        'Up to 2,000 characters per translation',
        'Standard speech synthesis output',
        'Auto-language detection',
        '3D interactive globe preview',
        'Timeline history log (local storage)'
      ],
      btnText: 'Start translating',
      btnClass: 'bg-slate-900 border border-white/10 text-slate-200 hover:bg-slate-800',
      recommended: false
    },
    {
      name: 'Pro',
      desc: 'Advanced tools and unlimited capacity for professionals.',
      price: billingPeriod === 'monthly' ? '$19' : '$15',
      period: '/mo',
      features: [
        'Unlimited character limits',
        'Cross-browser speech recognition',
        'Premium high-fidelity audio voices',
        'PDF translation reports download',
        'Context & grammatical accuracy metrics',
        'Favorites & pinning history support',
        'Priority server-side processing speed'
      ],
      btnText: 'Upgrade to Pro',
      btnClass: 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20',
      recommended: true
    },
    {
      name: 'Enterprise',
      desc: 'Seamless developer APIs and compliance logs for organizations.',
      price: billingPeriod === 'monthly' ? '$89' : '$72',
      period: '/mo',
      features: [
        'Everything in Pro tier included',
        'Dedicated secure developer APIs',
        'Custom translation models training',
        '99.9% guaranteed uptime SLA',
        'Premium single sign-on (SSO)',
        '24/7 dedicated support team access'
      ],
      btnText: 'Contact enterprise',
      btnClass: 'bg-slate-900 border border-white/10 text-slate-200 hover:bg-slate-800',
      recommended: false
    }
  ];

  return (
    <section id="pricing" className="pricing-section py-16 px-4 md:px-8 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Heading */}
        <div className="text-center max-w-xl mb-12">
          <p className="text-xs uppercase font-extrabold text-cyan-400 tracking-widest">SaaS Plans</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">Flexible SaaS Pricing</h2>
          <p className="text-sm text-slate-400 mt-2">
            Unlock advanced accuracy models, priority voice synthesis, and document translation exports.
          </p>

          {/* Billing Switcher */}
          <div className="flex bg-slate-900/60 border border-white/5 rounded-xl p-1 backdrop-blur-md self-center mt-6 inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 ${
                billingPeriod === 'monthly'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 ${
                billingPeriod === 'yearly'
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yearly
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 uppercase tracking-wide">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 w-full items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-6 rounded-3xl backdrop-blur-md border relative transition-all duration-300 hover:-translate-y-1 ${
                tier.recommended
                  ? 'border-cyan-500/30 bg-slate-950/60 shadow-[0_0_30px_rgba(34,211,238,0.08)]'
                  : 'border-white/5 bg-slate-950/20'
              }`}
            >
              {tier.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase font-extrabold px-3 py-1 rounded-full bg-cyan-400 text-slate-950 tracking-widest shadow-md">
                  Most Popular
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{tier.desc}</p>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">{tier.period}</span>
                </div>
              </div>

              <a
                href="#translator"
                className={`block w-full py-3 text-center rounded-xl text-xs font-bold tracking-wider uppercase mb-8 transition-all duration-200 ${tier.btnClass}`}
              >
                {tier.btnText}
              </a>

              {/* Features List */}
              <div className="space-y-3.5 border-t border-white/5 pt-6">
                <p className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Features Included:</p>
                {tier.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <BiCheck className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
