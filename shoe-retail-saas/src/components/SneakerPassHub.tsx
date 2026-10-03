import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { SUBSCRIPTION_TIERS } from '../data/mockData';
import { SubscriptionTier } from '../types';
import { 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Flame, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface SneakerPassHubProps {
  onSubscribe: (tier: SubscriptionTier, annual: boolean) => void;
}

export const SneakerPassHub: React.FC<SneakerPassHubProps> = ({ onSubscribe }) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [subscribedTierId, setSubscribedTierId] = useState<string | null>(null);

  const handleSubscribeClick = (tier: SubscriptionTier) => {
    setSubscribedTierId(tier.id);
    onSubscribe(tier, isAnnual);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
    } catch (e) {
      // Graceful fallback
    }

    setTimeout(() => {
      setSubscribedTierId(null);
    }, 3000);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
      
      {/* Club Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Footwear-as-a-Service (FaaS) & SneakerPass</span>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
          Never Miss a Drop. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
            Continuous Footwear Innovation.
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Choose a recurring membership tier. Guaranteed drop allocations, bi-monthly bespoke insoles, and private access to our Oregon design lab.
        </p>

        {/* Monthly vs Annual Switcher */}
        <div className="inline-flex items-center gap-3 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl mt-4">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              !isAnnual ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>

          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              isAnnual ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual Pass</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Subscription Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const price = isAnnual ? tier.priceAnnual : tier.priceMonthly;
          const isSubscribed = subscribedTierId === tier.id;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 ${
                tier.isPopular
                  ? 'bg-gradient-to-b from-blue-950/60 via-slate-900/90 to-slate-950 border-2 border-blue-500/60 shadow-2xl shadow-blue-500/20 md:-translate-y-2'
                  : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 shadow-xl'
              }`}
            >
              {/* Popular Badge */}
              {tier.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-lg shadow-blue-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{tier.badge}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-xl text-white">{tier.name}</h3>
                  {!tier.isPopular && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {tier.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-2 min-h-[36px] leading-relaxed">
                  {tier.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-black text-4xl text-white">
                      {formatCurrency(price)}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">
                    {tier.perks}
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-6 space-y-3">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    Included Benefits:
                  </span>
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSubscribeClick(tier)}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isSubscribed
                      ? 'bg-emerald-600 text-white'
                      : tier.isPopular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Membership Activated!</span>
                    </>
                  ) : (
                    <>
                      <span>Join {tier.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center text-[10px] text-slate-500 mt-2 font-mono">
                  {tier.subscribersCount.toLocaleString()} active members enrolled
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
