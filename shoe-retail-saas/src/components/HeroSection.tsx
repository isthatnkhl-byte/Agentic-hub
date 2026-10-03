import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  BarChart2,
  Box
} from 'lucide-react';
import { ThreeShoeViewer } from './ThreeShoeViewer';
import { ActiveTab } from '../types';

interface HeroSectionProps {
  onExploreProducts: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  openFitAdvisor: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreProducts,
  setActiveTab,
  openFitAdvisor,
}) => {
  // Hero interactive 3D sneaker state
  const [heroColorway, setHeroColorway] = useState({
    name: 'Cyber Volt & Carbon',
    upper: '#0ea5e9',
    sole: '#ffffff',
    accent: '#10b981',
    laces: '#10b981',
    cushion: '#06b6d4',
  });

  const heroPresets = [
    {
      name: 'Cyber Volt',
      hex: '#0ea5e9',
      upper: '#0ea5e9',
      sole: '#ffffff',
      accent: '#10b981',
      laces: '#10b981',
      cushion: '#06b6d4',
    },
    {
      name: 'Midnight Stealth',
      hex: '#1e293b',
      upper: '#1e293b',
      sole: '#0f172a',
      accent: '#38bdf8',
      laces: '#94a3b8',
      cushion: '#3b82f6',
    },
    {
      name: 'Solar Crimson',
      hex: '#ef4444',
      upper: '#ef4444',
      sole: '#f8fafc',
      accent: '#f59e0b',
      laces: '#ffffff',
      cushion: '#f97316',
    },
    {
      name: 'Glitch Violet',
      hex: '#8b5cf6',
      upper: '#8b5cf6',
      sole: '#18181b',
      accent: '#ec4899',
      laces: '#ec4899',
      cushion: '#a855f7',
    },
  ];

  return (
    <div className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-slate-800/80">
      {/* Background Radial Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-teal-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Brand Copy & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Next-Gen Footwear Retail & SaaS OS</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-normal">Spring 2026 Fleet Active</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Footwear Engineered for the <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Digital Age.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              From dynamic 3D WebGL customization and zero-return SmartFit™ AI vision to automated hype drop queues and enterprise retail analytics — built for modern footwear brands.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onExploreProducts}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-0.5"
              >
                <span>Shop Catalog Drops</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('customizer')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm backdrop-blur-md transition-all hover:border-slate-600"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Launch 3D Studio</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('saas-dashboard')}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 font-medium text-xs backdrop-blur-md transition-all"
              >
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span>Brand Retail OS</span>
              </button>
            </div>

            {/* Metric Highlights Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-display font-bold text-2xl">
                  <span>2.4%</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Sizing Return Rate</div>
                <div className="text-[10px] text-slate-500 font-mono">vs 22% standard</div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-blue-400 font-display font-bold text-2xl">
                  <span>188g</span>
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Ultra-Light Weight</div>
                <div className="text-[10px] text-slate-500 font-mono">Carbon chassis</div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-display font-bold text-2xl">
                  <span>3.2x</span>
                  <Box className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xs text-slate-400 mt-0.5">3D Conversion Lift</div>
                <div className="text-[10px] text-slate-500 font-mono">WebGL interactive</div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Interactive 3D Sneaker Canvas */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-blue-500/20 via-slate-800/50 to-slate-900/80 shadow-2xl backdrop-blur-xl">
              
              {/* Top floating pill */}
              <div className="absolute -top-3.5 left-6 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-semibold text-slate-200 shadow-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Live 3D WebGL Digital Twin</span>
              </div>

              {/* 3D Canvas Box */}
              <ThreeShoeViewer
                upperColor={heroColorway.upper}
                soleColor={heroColorway.sole}
                accentColor={heroColorway.accent}
                lacesColor={heroColorway.laces}
                cushionColor={heroColorway.cushion}
                className="h-[380px] sm:h-[440px] w-full"
                autoRotateDefault={true}
                interactiveHotspots={true}
              />

              {/* Colorway Switcher Bar */}
              <div className="mt-2 p-3 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">Colorway:</span>
                  <span className="text-xs font-bold text-white">{heroColorway.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {heroPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setHeroColorway(preset)}
                      className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 ${
                        heroColorway.name === preset.name
                          ? 'border-white scale-110 shadow-lg shadow-blue-500/30'
                          : 'border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('customizer')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  Full 3D Studio &rarr;
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
