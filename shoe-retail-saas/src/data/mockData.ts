import { Shoe, SubscriptionTier, RaffleDrop, SaaSMetric } from '../types';

export const INITIAL_SHOES: Shoe[] = [
  {
    id: 'stride-aero-pro',
    name: 'STRIDE AeroPulse X1',
    tagline: 'Nitrogen-cushioned carbon racer engineered for sub-3 marathons',
    category: 'Aeroknit Running',
    price: 245,
    originalPrice: 280,
    rating: 4.9,
    reviewsCount: 382,
    badge: 'Carbon Plate',
    colors: [
      {
        name: 'Cyber Volt & Carbon',
        hex: '#0ea5e9',
        secondaryHex: '#0f172a',
        accentHex: '#10b981',
        soleHex: '#ffffff',
        lacesHex: '#10b981'
      },
      {
        name: 'Midnight Stealth',
        hex: '#1e293b',
        secondaryHex: '#020617',
        accentHex: '#38bdf8',
        soleHex: '#0f172a',
        lacesHex: '#94a3b8'
      },
      {
        name: 'Solar Crimson',
        hex: '#ef4444',
        secondaryHex: '#7f1d1d',
        accentHex: '#f59e0b',
        soleHex: '#f8fafc',
        lacesHex: '#ffffff'
      }
    ],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13],
    stockPerSize: {
      7: 12, 7.5: 8, 8: 14, 8.5: 22, 9: 18, 9.5: 24, 10: 16, 10.5: 4, 11: 9, 11.5: 6, 12: 5, 13: 3
    },
    description: 'The pinnacle of marathon racing geometry. Features our proprietary full-length carbon fiber propulsion blade wrapped in dual-density supercritical nitrogen foam. Ultra-breathable single-layer mono-mesh keeps weight to an astonishing 188 grams.',
    techSpecs: {
      weight: '188g (US 9)',
      cushioning: 'Nitrogen Supercritical ZoomFoam',
      drop: '8mm (39mm heel / 31mm forefoot)',
      carbonPlate: true,
      upperMaterial: 'VaporWeave Bio-Knit',
      sustainabilityRating: '92% Circular Certified'
    },
    returnRate: 2.1,
    hypeScore: 98,
    releaseDate: '2026-08-15',
    margin: 68,
    totalSold: 3410
  },
  {
    id: 'stride-nexus-core',
    name: 'STRIDE Nexus V3 Cyber',
    tagline: 'Futuristic streetwear silhouette with magnetic lacing and adaptive sole',
    category: 'Cyber Streetwear',
    price: 210,
    rating: 4.8,
    reviewsCount: 294,
    badge: 'Limited Drop',
    colors: [
      {
        name: 'Hyper Glitch Violet',
        hex: '#8b5cf6',
        secondaryHex: '#1e1b4b',
        accentHex: '#06b6d4',
        soleHex: '#18181b',
        lacesHex: '#a855f7'
      },
      {
        name: 'Neo Tokyo Phantom',
        hex: '#09090b',
        secondaryHex: '#27272a',
        accentHex: '#ec4899',
        soleHex: '#ffffff',
        lacesHex: '#ec4899'
      },
      {
        name: 'Cryo Glacier White',
        hex: '#f1f5f9',
        secondaryHex: '#cbd5e1',
        accentHex: '#3b82f6',
        soleHex: '#e2e8f0',
        lacesHex: '#2563eb'
      }
    ],
    sizes: [7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12],
    stockPerSize: {
      7: 6, 8: 9, 8.5: 15, 9: 11, 9.5: 19, 10: 8, 10.5: 2, 11: 7, 12: 4
    },
    description: 'Engineered for metropolitan explorers living in the year 2030. Built with water-repellent ballistic Cordura, 3M Scotchlite reflective overlays, and a sculptured chunky kinetic sole with embedded TPU shock dispersion chambers.',
    techSpecs: {
      weight: '340g (US 9)',
      cushioning: 'Kinetic Gel + EVA Composite',
      drop: '10mm',
      carbonPlate: false,
      upperMaterial: 'Ballistic Cordura & 3M Reflective',
      sustainabilityRating: '84% Recycled'
    },
    returnRate: 3.2,
    hypeScore: 95,
    releaseDate: '2026-09-01',
    margin: 62,
    totalSold: 2890
  },
  {
    id: 'stride-terra-summit',
    name: 'STRIDE Terra Apex GORE-TEX',
    tagline: 'All-terrain alpine trail runner with Vibram Megagrip lugged outsole',
    category: 'Trail & Outdoor',
    price: 195,
    rating: 4.9,
    reviewsCount: 512,
    badge: 'Bestseller',
    colors: [
      {
        name: 'Alpine Moss & Clay',
        hex: '#15803d',
        secondaryHex: '#78350f',
        accentHex: '#f97316',
        soleHex: '#27272a',
        lacesHex: '#ea580c'
      },
      {
        name: 'Obsidian Basalt',
        hex: '#1c1917',
        secondaryHex: '#44403c',
        accentHex: '#eab308',
        soleHex: '#292524',
        lacesHex: '#facc15'
      }
    ],
    sizes: [7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13],
    stockPerSize: {
      7.5: 14, 8: 18, 8.5: 25, 9: 30, 9.5: 28, 10: 15, 10.5: 7, 11: 12, 11.5: 8, 12: 9, 13: 4
    },
    description: 'Conquer wet ridgelines, muddy descents, and granite scree fields without hesitation. Guaranteed waterproof GORE-TEX Invisible Fit membrane fused directly to the ripstop upper with 5mm directional multidirectional traction lugs.',
    techSpecs: {
      weight: '295g (US 9)',
      cushioning: 'Dual Density Trail-Cell',
      drop: '6mm',
      carbonPlate: false,
      upperMaterial: 'Ripstop Cordura + GORE-TEX',
      sustainabilityRating: '88% Eco-Durable'
    },
    returnRate: 1.8,
    hypeScore: 91,
    releaseDate: '2026-07-20',
    margin: 64,
    totalSold: 4720
  },
  {
    id: 'stride-gravity-dunk',
    name: 'STRIDE Gravity Shift Low',
    tagline: 'High-court tournament basketball sneaker with lateral containment cage',
    category: 'Court Performance',
    price: 185,
    rating: 4.7,
    reviewsCount: 198,
    badge: 'SmartFit Gen-3',
    colors: [
      {
        name: 'Hyper Royal & Gold',
        hex: '#2563eb',
        secondaryHex: '#1e3a8a',
        accentHex: '#fbbf24',
        soleHex: '#ffffff',
        lacesHex: '#ffffff'
      },
      {
        name: 'Blackout Stealth',
        hex: '#000000',
        secondaryHex: '#171717',
        accentHex: '#ef4444',
        soleHex: '#171717',
        lacesHex: '#ef4444'
      }
    ],
    sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14],
    stockPerSize: {
      8: 10, 8.5: 12, 9: 16, 9.5: 20, 10: 22, 10.5: 11, 11: 14, 11.5: 9, 12: 7, 13: 5, 14: 3
    },
    description: 'Designed for explosive first-step slashers and defensive perimeter anchors. Features TPU sidewall stabilizers to prevent ankle rollover and a herringbone pivot-point traction pattern for instantaneous stop-and-pop release.',
    techSpecs: {
      weight: '365g (US 9)',
      cushioning: 'Air Zoom Strobel + React Core',
      drop: '7mm',
      carbonPlate: true,
      upperMaterial: 'Engineered Leno-Weave',
      sustainabilityRating: '76% Recycled'
    },
    returnRate: 2.8,
    hypeScore: 89,
    releaseDate: '2026-06-11',
    margin: 58,
    totalSold: 2180
  },
  {
    id: 'stride-eco-luxe',
    name: 'STRIDE Circulaire Luxe Minimal',
    tagline: 'Crafted from 100% ocean plastic and upcycled mycelium leather',
    category: 'Eco-Recycled Luxe',
    price: 220,
    rating: 4.9,
    reviewsCount: 420,
    badge: 'Eco Edition',
    colors: [
      {
        name: 'Natural Dune & Algae',
        hex: '#d4c5b9',
        secondaryHex: '#78716c',
        accentHex: '#059669',
        soleHex: '#e7e5e4',
        lacesHex: '#78716c'
      },
      {
        name: 'Ocean Abyssal Teal',
        hex: '#0f766e',
        secondaryHex: '#134e4a',
        accentHex: '#38bdf8',
        soleHex: '#f0fdf4',
        lacesHex: '#99f6e4'
      }
    ],
    sizes: [6, 7, 8, 9, 10, 11, 12],
    stockPerSize: {
      6: 8, 7: 12, 8: 19, 9: 25, 10: 21, 11: 13, 12: 6
    },
    description: 'Luxury aesthetics meet closed-loop radical circularity. Zero petrochemical glues, 100% biodegradable stitching, and an outsole made from sustainably tapped natural Hevea tree rubber. Designed to be completely recycled when retired.',
    techSpecs: {
      weight: '260g (US 9)',
      cushioning: 'Sugarcane-Derived Bio-Foam',
      drop: '4mm',
      carbonPlate: false,
      upperMaterial: 'Mycelium Leather & Bio-Cotton',
      sustainabilityRating: '100% Closed Loop'
    },
    returnRate: 1.4,
    hypeScore: 94,
    releaseDate: '2026-08-30',
    margin: 66,
    totalSold: 3120
  },
  {
    id: 'stride-velocity-strike',
    name: 'STRIDE Velocity Strike Pro',
    tagline: 'Daily high-mileage tempo trainer with dynamic energy rebound',
    category: 'Aeroknit Running',
    price: 170,
    originalPrice: 190,
    rating: 4.8,
    reviewsCount: 630,
    badge: 'Bestseller',
    colors: [
      {
        name: 'Electric Solar Orange',
        hex: '#f97316',
        secondaryHex: '#9a3412',
        accentHex: '#e11d48',
        soleHex: '#ffffff',
        lacesHex: '#fbbf24'
      },
      {
        name: 'Glacier Pure White',
        hex: '#ffffff',
        secondaryHex: '#e2e8f0',
        accentHex: '#0284c7',
        soleHex: '#0284c7',
        lacesHex: '#0284c7'
      }
    ],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    stockPerSize: {
      7: 15, 7.5: 20, 8: 32, 8.5: 41, 9: 45, 9.5: 38, 10: 29, 10.5: 8, 11: 17, 11.5: 12, 12: 10
    },
    description: 'Built for 800+ kilometers of pounding asphalt without midsole pack-out. Delivers a plush yet snappily responsive ride that turns long weekend grinds into effortless cadence flows.',
    techSpecs: {
      weight: '225g (US 9)',
      cushioning: 'PulseMax High Rebound Foam',
      drop: '8mm',
      carbonPlate: false,
      upperMaterial: 'Engineered Circular Mesh',
      sustainabilityRating: '80% Recycled'
    },
    returnRate: 2.2,
    hypeScore: 88,
    releaseDate: '2026-05-18',
    margin: 60,
    totalSold: 6180
  }
];

export const SAAS_METRICS: SaaSMetric[] = [
  {
    title: 'Gross Merchandise Value (GMV)',
    value: '$1,428,950',
    change: '+28.4%',
    isPositive: true,
    timeframe: 'vs last 30 days',
    iconName: 'DollarSign',
    tooltip: 'Total online footwear checkout volume across all omnichannel endpoints'
  },
  {
    title: 'SmartFit™ Return Rate',
    value: '2.4%',
    change: '-18.6%',
    isPositive: true,
    timeframe: 'Industry Avg: 22.0%',
    iconName: 'ShieldCheck',
    tooltip: 'Returns due to wrong size reduced by 89% via our AI sizing vision model'
  },
  {
    title: 'SneakerPass™ ARR',
    value: '$348,200',
    change: '+34.2%',
    isPositive: true,
    timeframe: '4,210 Active Members',
    iconName: 'Repeat',
    tooltip: 'Predictable recurring subscription revenue from monthly shoe clubs and care kits'
  },
  {
    title: '3D Customizer Conversion',
    value: '8.4%',
    change: '+3.1%',
    isPositive: true,
    timeframe: '3.2x higher than static 2D',
    iconName: 'Box',
    tooltip: 'Visitors who interact with the 3D sneaker studio convert at a 8.4% rate'
  }
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'club-runner',
    name: 'Runner Club Pass',
    badge: 'Essential',
    priceMonthly: 24,
    priceAnnual: 240,
    tagline: 'Keep your mileage fresh with continuous recovery and insole upgrades',
    features: [
      'Bi-monthly pair of OrthoStride™ custom insoles ($60 value)',
      'Quarterly HydroShield™ footwear protection spray pack',
      'Flat 15% off all regular shoe models year-round',
      'Free expedited 2-day delivery on all orders',
      'Dedicated digital running gait analysis via app'
    ],
    perks: 'Save $180+ yearly on footwear maintenance',
    subscribersCount: 2640
  },
  {
    id: 'hype-pro',
    name: 'Sneakerhead Pro',
    badge: 'Most Popular',
    isPopular: true,
    priceMonthly: 69,
    priceAnnual: 690,
    tagline: 'Guaranteed drop access, zero bots, and members-only secret colorways',
    features: [
      'Guaranteed 1 Limited Hype Drop allocation per quarter',
      '2-hour early queue bypass on all high-demand releases',
      'Secret Discord alpha channel with release radar & designers',
      'Exclusive bespoke colorways locked to non-members',
      'Free returns & instant size exchange insurance'
    ],
    perks: 'Never take an L on limited sneaker drops again',
    subscribersCount: 1290
  },
  {
    id: 'founders-vault',
    name: 'Founders Bespoke Vault',
    badge: 'Ultra Exclusive',
    priceMonthly: 189,
    priceAnnual: 1890,
    tagline: '1-of-1 bespoke footwear tailored to your unique anatomical 3D scan',
    features: [
      'Two (2) custom bespoke 3D-printed shoes per year crafted to your foot scan',
      'Custom laser-etched serial number and personal signature plate',
      'Personal 1-on-1 design session with lead footwear architect',
      'Lifetime structural warranty on soles & carbon plates',
      'All VIP drop benefits with 100% allocation guarantee'
    ],
    perks: 'Only 300 active slots worldwide (Currently 280 filled)',
    subscribersCount: 280
  }
];

export const RAFFLE_DROPS: RaffleDrop[] = [
  {
    id: 'drop-aeropulse-prototype',
    shoeName: 'STRIDE AeroPulse Prototype "Tokyo Dusk"',
    edition: 'Numbered Run of 250 Pairs Worldwide',
    retailPrice: 320,
    estimatedResale: 780,
    totalPairs: 250,
    entriesCount: 3418,
    dropTime: '2026-10-06T18:00:00Z',
    status: 'Live',
    colors: {
      name: 'Tokyo Dusk Iridescent',
      hex: '#6366f1',
      secondaryHex: '#1e1b4b',
      accentHex: '#f43f5e',
      soleHex: '#09090b',
      lacesHex: '#f43f5e'
    },
    specsSummary: 'Infused with titanium micro-mesh and electro-luminescent reflective accents.'
  },
  {
    id: 'drop-cyber-obsidian-gold',
    shoeName: 'STRIDE Nexus V3 "Sovereign Gold"',
    edition: 'Only 150 Pairs Hand-Finished',
    retailPrice: 290,
    estimatedResale: 620,
    totalPairs: 150,
    entriesCount: 1940,
    dropTime: '2026-10-10T14:00:00Z',
    status: 'Upcoming',
    colors: {
      name: '24K Obsidian Carbon',
      hex: '#0f172a',
      secondaryHex: '#eab308',
      accentHex: '#facc15',
      soleHex: '#020617',
      lacesHex: '#eab308'
    },
    specsSummary: 'Featuring genuine 24-karat gold leaf foil beneath crystalline TPU soles.'
  }
];

export const SAAS_REVENUE_CHART_DATA = {
  '7D': [
    { label: 'Mon', revenue: 38400, units: 182, returns: 4 },
    { label: 'Tue', revenue: 42100, units: 201, returns: 5 },
    { label: 'Wed', revenue: 51200, units: 248, returns: 6 },
    { label: 'Thu', revenue: 48900, units: 231, returns: 5 },
    { label: 'Fri', revenue: 64200, units: 310, returns: 8 },
    { label: 'Sat', revenue: 89400, units: 432, returns: 10 },
    { label: 'Sun', revenue: 76800, units: 375, returns: 9 }
  ],
  '30D': [
    { label: 'Week 1', revenue: 298000, units: 1450, returns: 32 },
    { label: 'Week 2', revenue: 342000, units: 1680, returns: 39 },
    { label: 'Week 3', revenue: 388000, units: 1910, returns: 44 },
    { label: 'Week 4', revenue: 400950, units: 2020, returns: 46 }
  ],
  '90D': [
    { label: 'Jul 2026', revenue: 1120000, units: 5400, returns: 130 },
    { label: 'Aug 2026', revenue: 1290000, units: 6250, returns: 148 },
    { label: 'Sep 2026', revenue: 1428950, units: 7060, returns: 161 }
  ],
  '1Y': [
    { label: 'Q4 25', revenue: 2840000, units: 14100, returns: 380 },
    { label: 'Q1 26', revenue: 3210000, units: 15900, returns: 410 },
    { label: 'Q2 26', revenue: 3890000, units: 19300, returns: 480 },
    { label: 'Q3 26', revenue: 4620000, units: 22800, returns: 540 }
  ]
};

export const WAREHOUSE_INVENTORY = [
  { location: 'Los Angeles Hub (US-West)', inStock: 14200, reserved: 1820, capacityPct: 88, status: 'Optimal' },
  { location: 'Frankfurt Hub (EU-Central)', inStock: 9800, reserved: 1210, capacityPct: 76, status: 'Optimal' },
  { location: 'Tokyo Bay Hub (APAC)', inStock: 6400, reserved: 940, capacityPct: 91, status: 'Replenish Soon' },
  { location: 'Singapore FreePort (SEA)', inStock: 4800, reserved: 510, capacityPct: 62, status: 'Optimal' }
];

export const RETURN_REASONS_BREAKDOWN = [
  { reason: 'Fit Mismatch (Resolved via SmartFit)', percentage: 38, delta: '-74% YoY', count: 62 },
  { reason: 'Colorway Differed from Screen', percentage: 24, delta: '-12% YoY', count: 39 },
  { reason: 'Changed Mind / Buyer Remorse', percentage: 22, delta: '+2% YoY', count: 35 },
  { reason: 'Courier Box Damage', percentage: 11, delta: '-5% YoY', count: 18 },
  { reason: 'Defect or Manufacturing Flaw', percentage: 5, delta: '-40% YoY', count: 8 }
];
