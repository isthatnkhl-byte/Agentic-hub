import React, { useState } from 'react';
import { 
  Shoe, 
  SizingProfile, 
  SizingRecommendation 
} from '../types';
import { calculateSmartFit } from '../utils/helpers';
import { 
  X, 
  Sparkles, 
  Camera, 
  Sliders, 
  CheckCircle2, 
  ShieldCheck, 
  Footprints, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface SmartFitAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoe?: Shoe | null;
  onApplySize: (size: number) => void;
}

export const SmartFitAdvisorModal: React.FC<SmartFitAdvisorModalProps> = ({
  isOpen,
  onClose,
  shoe,
  onApplySize,
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);

  // Manual Profile State
  const [profile, setProfile] = useState<SizingProfile>({
    footLengthCm: 27.5,
    footWidth: 'Standard',
    archType: 'Medium / Neutral',
    preferredFit: 'True to Size',
  });

  const [recommendation, setRecommendation] = useState<SizingRecommendation>(() =>
    calculateSmartFit({
      footLengthCm: 27.5,
      footWidth: 'Standard',
      archType: 'Medium / Neutral',
      preferredFit: 'True to Size',
    })
  );

  if (!isOpen) return null;

  const handleProfileChange = (updated: Partial<SizingProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    setRecommendation(calculateSmartFit(newProfile));
  };

  const handleSimulateCameraScan = () => {
    setIsScanning(true);
    setScanCompleted(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
      const simulatedLength = 27.4 + Math.round((Math.random() * 0.6) * 10) / 10;
      const rec = calculateSmartFit({
        footLengthCm: simulatedLength,
        footWidth: profile.footWidth,
        archType: profile.archType,
        preferredFit: profile.preferredFit,
      });
      setProfile((prev) => ({ ...prev, footLengthCm: simulatedLength }));
      setRecommendation(rec);
    }, 1800);
  };

  const handleConfirm = () => {
    onApplySize(recommendation.recommendedSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">SmartFit™ AI Vision</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  99.2% Zero-Return Fit
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {shoe ? `Calibrating for ${shoe.name}` : 'Autonomous Footwear Sizing Advisor'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setScanMode('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                scanMode === 'camera'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>AI Camera Scan (30s)</span>
            </button>
            <button
              type="button"
              onClick={() => setScanMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                scanMode === 'manual'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manual Foot Metrics</span>
            </button>
          </div>

          {/* MODE 1: CAMERA SCAN SIMULATOR */}
          {scanMode === 'camera' ? (
            <div className="relative rounded-2xl bg-black border border-slate-800 p-6 overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              {/* Camera Guide Lines Overlay */}
              <div className="absolute inset-4 border border-dashed border-emerald-500/40 rounded-xl pointer-events-none flex items-center justify-center">
                <Footprints className="w-24 h-24 text-emerald-500/10 transform rotate-12" />
              </div>

              {isScanning && (
                <div className="absolute inset-0 bg-emerald-950/30 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                  <div className="w-48 h-1 bg-emerald-400 animate-pulse rounded-full shadow-lg shadow-emerald-400" />
                  <span className="text-xs text-emerald-300 font-mono mt-3 animate-pulse">
                    Analyzing Metatarsal Splay & Arch Curvature...
                  </span>
                </div>
              )}

              <div className="relative z-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">Place Foot on A4 White Paper</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    SmartFit uses computer vision edge detection to measure heel-to-toe length within 0.2mm precision.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateCameraScan}
                  disabled={isScanning}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning Anatomy...' : scanCompleted ? 'Re-Scan Foot' : 'Initiate Camera Scan'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* MODE 2: MANUAL METRICS */
            <div className="space-y-4">
              {/* Foot Length Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Foot Length (Heel-to-Toe)</span>
                  <span className="font-mono text-emerald-400 font-bold">{profile.footLengthCm} cm ({(profile.footLengthCm / 2.54).toFixed(1)} inches)</span>
                </div>
                <input
                  type="range"
                  min="23.0"
                  max="31.0"
                  step="0.5"
                  value={profile.footLengthCm}
                  onChange={(e) => handleProfileChange({ footLengthCm: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>23 cm (US 6)</span>
                  <span>27 cm (US 9.5)</span>
                  <span>31 cm (US 14)</span>
                </div>
              </div>

              {/* Foot Width */}
              <div>
                <span className="block text-xs text-slate-300 font-medium mb-1.5">Foot Width</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['Narrow', 'Standard', 'Wide'] as const).map((width) => (
                    <button
                      key={width}
                      type="button"
                      onClick={() => handleProfileChange({ footWidth: width })}
                      className={`py-2 text-xs rounded-xl font-medium transition-all ${
                        profile.footWidth === width
                          ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Preference */}
              <div>
                <span className="block text-xs text-slate-300 font-medium mb-1.5">Fit Preference</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['Snug / Racing', 'True to Size', 'Relaxed'] as const).map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => handleProfileChange({ preferredFit: fit })}
                      className={`py-2 text-xs rounded-xl font-medium transition-all ${
                        profile.preferredFit === fit
                          ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Result Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-950 to-blue-950/40 border border-emerald-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-400 font-mono uppercase tracking-wider block">
                  AI Recommended Size
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display font-extrabold text-3xl text-white">
                    US {recommendation.recommendedSize}
                  </span>
                  <span className="text-xs text-slate-400">
                    (EU {Math.round(recommendation.recommendedSize * 1.33 + 31)})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{recommendation.confidenceScore}% Confidence</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Est. Return Risk: <span className="text-emerald-400 font-mono">{recommendation.returnRiskPercentage}%</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-emerald-400 font-semibold">Diagnosis: </span>
              {recommendation.notes}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
          >
            <span>Apply Size US {recommendation.recommendedSize}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
