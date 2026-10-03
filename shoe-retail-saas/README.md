# STRIDE.AI — Intelligent Footwear Retail & SaaS Commerce Platform

A next-generation SaaS application and digital commerce platform built for online shoe retail brands. Combines real-time 3D sneaker visualization, AI-powered computer vision sizing recommendations, Footwear-as-a-Service (FaaS) subscription memberships, anti-bot raffle drop launches, and omni-channel retail operations intelligence.

---

## ⚡ Key Modules & Features

### 1. 🛍️ High-Conversion DTC Storefront
- **Dynamic Catalog**: Filter by performance category (*Aeroknit Running, Cyber Streetwear, Trail & Outdoor, Court Performance, Eco-Recycled Luxe*).
- **Interactive Shoe Cards**: Real-time colorway swatch switching, stock scarcity alerts, quick inspect triggers, and instant bag additions.
- **Product Detail Modal**: 360-degree inspection, anatomical specs breakdown (chassis weight, cushioning foam, heel drop, carbon propulsion plate), and warehouse stock levels.
- **Cart & Express Checkout**:
  - Slide-over cart drawer with free shipping progress threshold ($150 target).
  - Promo code engine (`STRIDE20` for 20% off, `KICKSFREE` for free delivery, `FOUNDER` for $50 off).
  - Multi-method checkout with Apple/Google Pay, Credit Card, and USDC/Solana Web3 payments.
  - Confetti celebrations (`canvas-confetti`) with generated digital receipt and tracking codes (`STRD-2026-XXXX`).

### 2. 🎨 3D WebGL Customizer Studio
- **Interactive Three.js Sneaker Canvas**:
  - Full 360-degree mouse/touch orbit rotation, zoom, and pitch controls.
  - Procedural footwear geometry: sculpted midsole with traction treads, nitrogen cushioning pods, aerodynamic upper knit, tongue, dynamic laces, and lateral lightning bolt swoosh.
  - Lighting presets (*Cyberpunk Neon, Studio White, Sunset Warm*), wireframe mesh topology mode, and interactive anatomy hotspots (*Nitrogen Pod, Carbon Blade, VaporWeave*).
- **Customization Engine**:
  - Component color customization (Upper, Sole, Accent, Laces, Nitrogen Pod).
  - Material finishes (*Matte Bio-Knit, High-Gloss Vapor Glaze, Chameleon Metallic, 3K Carbon Fiber*).
  - Performance hardware upgrades (*Carbon Propulsion Blade, OrthoStride™ Memory Insoles*).
  - Personalized laser engraving monogram etched onto the heel counter.
  - Designer preset colorways (*Cyberpunk Neon, Tokyo Volt, Obsidian 24K, Desert Alpine, Panda Mono*).
  - Real-time dynamic pricing calculation.

### 3. 📊 Brand SaaS Operating System & Intelligence
- **Executive KPIs**: Real-time Gross Merchandise Value ($1.42M+), SmartFit™ Return Rate (2.4% vs 22% industry average), SneakerPass™ ARR ($348k), and 3D Customizer conversion lift (8.4%).
- **Interactive Revenue Telemetry**: Visual dynamic SVG area charts with timeframe filters (7D, 30D, 90D, 1Y) and hover tooltips.
- **AI Sizing Impact ROI**: Breakdown of reverse logistics savings ($184,200 saved) and return reasons YoY delta.
- **Global Inventory Fulfillment**: Real-time monitoring across Los Angeles, Frankfurt, Tokyo, and Singapore hubs.
- **Size Demand Bell-Curve**: Automatic restock warnings for edge and high-demand sizes.
- **Shoe SKU & Margin Manager**: Real-time retail price editing, profit margin tracking, and 3D asset links.

### 4. 💎 SneakerPass™ Footwear-as-a-Service (FaaS) Hub
- **Membership Tiers**:
  - *Runner Club Pass* ($24/mo / $240/yr): Bi-monthly custom insoles, HydroShield™ spray packs, 15% discount.
  - *Sneakerhead Pro* ($69/mo / $690/yr): Guaranteed quarterly hype drop allocation, 2-hour queue bypass, secret Discord alpha.
  - *Founders Bespoke Vault* ($189/mo / $1,890/yr): 2 bespoke 1-of-1 3D crafted shoes tailored to anatomical scan, laser serial numbers.
- Monthly vs Annual billing toggle with 20% discount calculation.

### 5. ⚡ Anti-Bot Hype Drops & Raffles
- Real-time countdown clock (hours, minutes, seconds).
- Live drop allocations with verified entry counters and cryptographic human verification.
- Fair-draw allocation odds calculator and estimated secondary resale value tracking.

### 6. 📐 SmartFit™ AI Vision Sizing Scanner
- Camera scan simulator with edge-detection foot alignment guides.
- Anatomical foot length (cm/inches), foot width (Narrow, Standard, Wide), arch curvature, and fit preference adjustments.
- Instant neural net recommendation: Recommended US size, 99.2% confidence score, and return risk minimization notes.

---

## 🛠️ Modern Tech Stack
- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 with HMR
- **Styling**: Tailwind CSS v4 + Glassmorphism + Custom Glow Filters
- **3D Graphics Engine**: Three.js WebGL Renderer + Orbit Interaction + Procedural Geometry
- **Iconography**: Lucide React
- **Micro-Interactions**: Canvas-Confetti, custom CSS animations, toast notification queue

---

## 🚀 Running the Project

### Development Server:
```bash
# From workspace root:
npm run dev:shoe

# Or inside the shoe-retail-saas folder:
cd shoe-retail-saas
npm run dev
```

### Production Build:
```bash
npm run build:shoe
```

### Preview Production Build:
```bash
npm run preview:shoe
```
