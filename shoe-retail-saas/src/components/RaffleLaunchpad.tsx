import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RAFFLE_DROPS } from '../data/mockData';
import { RaffleDrop } from '../types';
import { 
  Flame, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Ticket, 
  Zap,
  Users
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { ShoeSilhouetteSVG } from './ShoeSilhouetteSVG';

interface RaffleLaunchpadProps {
  onEnterRaffle: (drop: RaffleDrop) => void;
}

export const RaffleLaunchpad: React.FC<RaffleLaunchpadProps> = ({ onEnterRaffle }) => {
  // Live tick countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 42,
    minutes: 18,
    seconds: 35,
  });

  const [enteredDropIds, setEnteredDropIds] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEnterDrop = (drop: RaffleDrop) => {
    setIsVerifying(drop.id);

    setTimeout(() => {
      setIsVerifying(null);
      setEnteredDropIds((prev) => [...prev, drop.id]);
      onEnterRaffle(drop);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#6366f1', '#10b981']
        });
      } catch (e) {
        // Fallback
      }
    }, 1200);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
      
      {/* Launchpad Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Anti-Bot Cryptographic Raffle Engine</span>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
          Limited Edition Hype Drops
        </h2>

        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Numbered worldwide runs. Pure randomized blockchain fair-draw queue. Anti-bot heuristics block scripts and automated snipers.
        </p>
      </div>

      {/* Raffle Drop Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {RAFFLE_DROPS.map((drop) => {
          const isEntered = enteredDropIds.includes(drop.id);
          const odds = ((drop.totalPairs / (drop.entriesCount + (isEntered ? 1 : 0))) * 100).toFixed(1);

          return (
            <div
              key={drop.id}
              className="rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl overflow-hidden flex flex-col justify-between shadow-2xl relative"
            >
              {/* Top Banner */}
              <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                    {drop.status} Draw
                  </span>
                  <h3 className="font-display font-extrabold text-xl text-white mt-1">
                    {drop.shoeName}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{drop.edition}</div>
                </div>

                {/* Countdown Timer Display */}
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-mono flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3 text-rose-400" />
                    <span>Closes In</span>
                  </div>
                  <div className="font-mono font-bold text-sm text-white mt-0.5">
                    <span className="text-rose-400">{String(timeLeft.hours).padStart(2, '0')}h</span> :{' '}
                    <span>{String(timeLeft.minutes).padStart(2, '0')}m</span> :{' '}
                    <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
                  </div>
                </div>
              </div>

              {/* Shoe Silhouette Graphic */}
              <div className="p-4 bg-gradient-to-b from-slate-950/40 to-slate-900/40">
                <ShoeSilhouetteSVG colorway={drop.colors} className="h-56 w-full" />
              </div>

              {/* Drop Specs & Odds */}
              <div className="p-6 space-y-4 bg-slate-950/40">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {drop.specsSummary}
                </p>

                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-mono">Retail MSRP</span>
                    <span className="font-bold text-white font-mono">{formatCurrency(drop.retailPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-mono">Est. Resale</span>
                    <span className="font-bold text-emerald-400 font-mono flex items-center gap-1">
                      {formatCurrency(drop.estimatedResale)}
                      <TrendingUp className="w-3 h-3" />
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-mono">Allocation Odds</span>
                    <span className="font-bold text-cyan-400 font-mono">{odds}%</span>
                  </div>
                </div>

                {/* Entries Progress Bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      {formatNumber(drop.entriesCount + (isEntered ? 1 : 0))} Verified Entries
                    </span>
                    <span>{drop.totalPairs} Pairs Available</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, (drop.totalPairs / (drop.entriesCount / 10)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {isEntered ? (
                    <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">Entry Ticket Confirmed:</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-white bg-emerald-900/60 px-2 py-0.5 rounded">
                        #RF-{drop.id.slice(-4).toUpperCase()}-940
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isVerifying === drop.id}
                      onClick={() => handleEnterDrop(drop)}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>{isVerifying === drop.id ? 'Verifying Humanity with STRIDE Proof...' : 'Enter Verified Raffle Queue'}</span>
                    </button>
                  )}
                </div>

                <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>CloudFlare Bot Defense Active • 1 Entry per Human ID</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
