export type ShoeCategory = 
  | 'All' 
  | 'Aeroknit Running' 
  | 'Cyber Streetwear' 
  | 'Trail & Outdoor' 
  | 'Court Performance' 
  | 'Eco-Recycled Luxe';

export interface ShoeColorway {
  name: string;
  hex: string;
  secondaryHex: string;
  accentHex: string;
  soleHex: string;
  lacesHex: string;
}

export interface ShoeTechSpecs {
  weight: string;
  cushioning: string;
  drop: string;
  carbonPlate: boolean;
  upperMaterial: string;
  sustainabilityRating: string;
}

export interface Shoe {
  id: string;
  name: string;
  tagline: string;
  category: ShoeCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  badge?: 'Limited Drop' | 'Bestseller' | 'SmartFit Gen-3' | 'Carbon Plate' | 'Eco Edition' | 'Staff Pick';
  colors: ShoeColorway[];
  sizes: number[];
  stockPerSize: Record<number, number>;
  description: string;
  techSpecs: ShoeTechSpecs;
  returnRate: number; // in percentage e.g. 2.4%
  hypeScore: number; // 0-100
  releaseDate: string;
  margin: number; // percentage profit margin for SaaS dashboard
  totalSold: number;
}

export interface CustomizationConfig {
  baseShoeId: string;
  baseShoeName: string;
  upperColor: string;
  soleColor: string;
  accentColor: string;
  lacesColor: string;
  cushionColor: string;
  materialFinish: 'matte' | 'gloss' | 'metallic' | 'carbon';
  customText: string;
  carbonPlateUpgrade: boolean;
  orthoticInsoleUpgrade: boolean;
  calculatedPrice: number;
}

export interface CartItem {
  id: string; // unique item uuid
  shoe: Shoe;
  selectedColor: ShoeColorway;
  selectedSize: number;
  quantity: number;
  isCustom?: boolean;
  customConfig?: CustomizationConfig;
}

export interface SizingProfile {
  footLengthCm: number;
  footWidth: 'Narrow' | 'Standard' | 'Wide';
  archType: 'Low / Flat' | 'Medium / Neutral' | 'High';
  preferredFit: 'Snug / Racing' | 'True to Size' | 'Relaxed';
}

export interface SizingRecommendation {
  recommendedSize: number;
  confidenceScore: number;
  fitAssessment: string;
  returnRiskPercentage: number;
  notes: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  badge: string;
  priceMonthly: number;
  priceAnnual: number;
  tagline: string;
  features: string[];
  perks: string;
  isPopular?: boolean;
  subscribersCount: number;
}

export interface RaffleDrop {
  id: string;
  shoeName: string;
  edition: string;
  retailPrice: number;
  estimatedResale: number;
  totalPairs: number;
  entriesCount: number;
  dropTime: string; // ISO date string
  status: 'Upcoming' | 'Live' | 'Drawing Soon' | 'Ended';
  colors: ShoeColorway;
  specsSummary: string;
}

export interface SaaSMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeframe: string;
  iconName: string;
  tooltip: string;
}

export type ActiveTab = 
  | 'storefront' 
  | 'customizer' 
  | 'saas-dashboard' 
  | 'sneakerpass' 
  | 'raffle';
