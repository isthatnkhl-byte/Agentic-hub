import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  BarChart3, 
  Layers, 
  Flame, 
  Crown, 
  Footprints, 
  Menu, 
  X,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartCount: number;
  openCart: () => void;
  openFitAdvisor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  openCart,
  openFitAdvisor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'storefront', label: 'Storefront', icon: ShoppingBag, badge: 'New Drops' },
    { id: 'customizer', label: '3D Customizer', icon: Layers, badge: 'Studio' },
    { id: 'saas-dashboard', label: 'Brand SaaS OS', icon: BarChart3, badge: 'Enterprise' },
    { id: 'sneakerpass', label: 'SneakerPass Club', icon: Crown, badge: 'MRR' },
    { id: 'raffle', label: 'Hype Drops', icon: Flame, badge: '2 Live' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setActiveTab('storefront')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Footprints className="w-5 h-5 text-cyan-400 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  STRIDE<span className="text-blue-500">.AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  SaaS v3.4
                </span>
              </div>
              <span className="text-[11px] text-slate-400 tracking-wider uppercase font-medium">
                Autonomous Footwear Engine
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive 
                        ? 'bg-blue-700/60 text-blue-100' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-3">
            {/* SmartFit AI Advisor Trigger */}
            <button
              type="button"
              onClick={openFitAdvisor}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all shadow-sm"
              title="Open AI Smart Sizing Scanner"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>SmartFit™ AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>

            {/* Quick Switch to SaaS OS button */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'saas-dashboard' ? 'storefront' : 'saas-dashboard')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activeTab === 'saas-dashboard' ? 'Back to Store' : 'Retail OS'}</span>
            </button>

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-md shadow-blue-500/50 animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                openFitAdvisor();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 text-sm font-semibold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Launch SmartFit™ AI Scanner</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
