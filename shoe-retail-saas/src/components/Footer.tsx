import React, { useState } from 'react';
import { 
  Footprints, 
  Sparkles, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Globe 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSubscribeNewsletter: (email: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onSubscribeNewsletter }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubscribeNewsletter(email);
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Footprints className="w-4 h-4 text-cyan-400 -rotate-12" />
                </div>
              </div>
              <span className="font-display font-black text-xl text-white">
                STRIDE<span className="text-blue-500">.AI</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The next-generation footwear commerce operating system. Generative 3D configuration, camera-based anatomical fit AI, automated bot-free drops, and real-time retail intelligence.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400">
                Cloud Operations: 99.99% Uptime (All Nodes Active)
              </span>
            </div>
          </div>

          {/* Quick Links Column 1 */}
          <div className="lg:col-span-2 space-y-3">
            <span className="font-mono text-[11px] font-semibold text-white uppercase tracking-wider block">
              Platform Modules
            </span>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('storefront')}
                  className="hover:text-blue-400 transition-colors"
                >
                  Footwear Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('customizer')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  3D WebGL Studio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('saas-dashboard')}
                  className="hover:text-indigo-400 transition-colors"
                >
                  Retail SaaS OS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('sneakerpass')}
                  className="hover:text-amber-400 transition-colors"
                >
                  SneakerPass Club
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveTab('raffle')}
                  className="hover:text-rose-400 transition-colors"
                >
                  Anti-Bot Hype Drops
                </button>
              </li>
            </ul>
          </div>

          {/* Tech Stack Badges Column */}
          <div className="lg:col-span-3 space-y-3">
            <span className="font-mono text-[11px] font-semibold text-white uppercase tracking-wider block">
              Modern Toolset
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Vite 8 & React 19', icon: Zap },
                { name: 'Three.js WebGL 3D', icon: Cpu },
                { name: 'Tailwind CSS v4', icon: Sparkles },
                { name: 'TypeScript Strict', icon: ShieldCheck },
                { name: 'SmartFit AI Vision', icon: Footprints },
                { name: 'Global Edge CDN', icon: Globe },
              ].map((badge) => {
                const Icon = badge.icon;
                return (
                  <span
                    key={badge.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
                  >
                    <Icon className="w-3 h-3 text-blue-400" />
                    <span>{badge.name}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Newsletter Subscribe */}
          <div className="lg:col-span-3 space-y-3">
            <span className="font-mono text-[11px] font-semibold text-white uppercase tracking-wider block">
              Hype Release Radar
            </span>
            <p className="text-xs text-slate-400">
              Get notified 15 minutes before unannounced drop allocations and lab prototypes.
            </p>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@domain.com"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shrink-0"
              >
                {subscribed ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {subscribed && (
              <span className="text-[11px] text-emerald-400 block font-mono">
                ✓ Priority drop notifications activated.
              </span>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 STRIDE AI Technologies Inc. All rights reserved. Precision Footwear & SaaS Engineering.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Protocol</a>
            <a href="#terms" className="hover:text-slate-300 transition-colors">Terms of Fleet</a>
            <a href="#security" className="hover:text-slate-300 transition-colors">Security Whitepaper</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
