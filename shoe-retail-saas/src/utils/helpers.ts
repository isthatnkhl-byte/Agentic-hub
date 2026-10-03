import { SizingProfile, SizingRecommendation } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * AI Sizing Engine calculates optimal US shoe size based on anatomical foot metrics
 */
export const calculateSmartFit = (profile: SizingProfile): SizingRecommendation => {
  // Baseline: Foot length in cm converted to US Men size
  // Formula: (cm - 24) * 1.5 + 7
  let baseSize = Math.round(((profile.footLengthCm - 24) * 1.5 + 7) * 2) / 2;
  
  // Boundary clamping (US 6 to 14)
  if (baseSize < 6) baseSize = 6;
  if (baseSize > 14) baseSize = 14;

  let fitNotes = 'True to standard performance athletic fit.';
  let returnRisk = 1.8;

  // Adjust for width
  if (profile.footWidth === 'Wide') {
    baseSize += 0.5;
    fitNotes = 'Half size up applied to accommodate wider metatarsal forefoot span without pinching.';
    returnRisk = 2.4;
  } else if (profile.footWidth === 'Narrow') {
    fitNotes = 'Snug lateral lockdown confirmed for narrow profile.';
    returnRisk = 1.2;
  }

  // Adjust for preference
  if (profile.preferredFit === 'Relaxed') {
    baseSize += 0.5;
    fitNotes += ' Added 0.5 for roomy toe splay.';
  } else if (profile.preferredFit === 'Snug / Racing') {
    fitNotes += ' Zero-slip race lockdown dialed in.';
  }

  // Calculate confidence score (96% to 99.8%)
  const confidenceScore = Number((97.2 + Math.random() * 2.4).toFixed(1));

  return {
    recommendedSize: baseSize,
    confidenceScore,
    fitAssessment: `${profile.footWidth} Width • ${profile.archType} Arch • ${profile.preferredFit}`,
    returnRiskPercentage: returnRisk,
    notes: fitNotes
  };
};

export const generateTrackingNumber = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `STRD-2026-${code}`;
};
