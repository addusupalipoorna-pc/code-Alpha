import { useState } from 'react';
import LogoSrc from '../assets/logo.svg';
import { BiMailSend } from 'react-icons/bi';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { FaDiscord } from 'react-icons/fa';
import { subscribeNewsletter } from '../services/api.js';

export default function FooterSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
  });
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await subscribeNewsletter({
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        password: formData.password,
      });
      setSubscribed(true);
      setFormData({ name: '', email: '', contact: '', password: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Translation Studio', href: '#translator' },
        { label: 'Features Engine', href: '#features' },
        { label: 'Pricing Plans', href: '#pricing' },
        { label: 'SaaS API Docs', href: '#' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Developer Portal', href: '#' },
        { label: 'AI Release Notes', href: '#' },
        { label: 'Status Monitor', href: '#' },
        { label: 'Help Desk', href: '#faq' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Security & ISO', href: '#' }
      ]
    }
  ];

  return (
    <footer className="footer-section py-16 px-4 md:px-8 border-t border-white/5 bg-[#02020a]/40 backdrop-blur-md relative select-none">
      <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-12">
        {/* Brand & Newsletter col */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <a href="#" className="flex items-center gap-3 select-none self-start">
            <img src={LogoSrc} alt="" className="h-8 w-8" />
            <span className="flex flex-col text-left">
              <span className="text-base font-extrabold text-white tracking-wide leading-none">Code Alpha</span>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest mt-0.5">AI Translator</span>
            </span>
          </a>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Empowering global communication with multi-model semantic translation. Formatted PDF report exports and timing-safe vocal synthesis out-of-the-box.
          </p>

          {/* Expanded Newsletter & Registration Signup Form */}
          <div className="w-full max-w-sm p-5 rounded-2xl bg-slate-950/60 border border-white/5">
            <p className="text-xs uppercase font-extrabold text-slate-300 tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Newsletter Registration</span>
            </p>
            
            {subscribed ? (
              <div className="text-xs text-cyan-400 font-bold flex flex-col gap-2 p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10">
                <p className="flex items-center gap-1.5 animate-pulse">
                  <BiMailSend className="text-base" /> Subscription Submitted!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full name"
                  className="bg-slate-950/80 border border-white/5 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500/30 transition placeholder-slate-600"
                />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  className="bg-slate-950/80 border border-white/5 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500/30 transition placeholder-slate-600"
                />
                <input
                  type="text"
                  name="contact"
                  required
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Contact number"
                  className="bg-slate-950/80 border border-white/5 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500/30 transition placeholder-slate-600"
                />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create password"
                  className="bg-slate-950/80 border border-white/5 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500/30 transition placeholder-slate-600"
                />
                {errorMsg && (
                  <p className="text-[10px] text-rose-400 font-bold">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider disabled:opacity-40 shadow transition-all hover:scale-[1.01]"
                >
                  {loading ? 'Registering...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Link Columns */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col space-y-4">
              <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-widest">{col.title}</h4>
              <ul className="space-y-2.5" aria-label={`${col.title} links`}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright & Socials footer row */}
      <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-[10px] text-slate-500 font-semibold tracking-wide">
          © {new Date().getFullYear()} Code Alpha Inc. All rights reserved. Made by deepmind developer.
        </p>

        {/* Social Icons with magnetic scaling */}
        <div className="flex gap-4 items-center">
          {[
            { Icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
            { Icon: FaDiscord, href: 'https://discord.com', label: 'Discord' },
            { Icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
            { Icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' }
          ].map((soc) => (
            <a
              key={soc.label}
              href={soc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 hover:scale-110 active:scale-95 transition-all"
              aria-label={soc.label}
            >
              <soc.Icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
