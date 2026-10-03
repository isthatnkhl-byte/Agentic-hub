import React, { useState } from 'react';
import { 
  Shoe, 
  CustomizationConfig, 
  ShoeColorway 
} from '../types';
import { ThreeShoeViewer } from './ThreeShoeViewer';
import { 
  Sparkles, 
  ShoppingBag, 
  RotateCcw, 
  Check, 
  Zap, 
  Layers, 
  Sliders, 
  Share2, 
  ShieldCheck,
  Palette
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface CustomizerStudioProps {
  baseShoe: Shoe;
  availableShoes: Shoe[];
  onSelectBaseShoe: (shoe: Shoe) => void;
  onAddCustomToCart: (config: CustomizationConfig, shoe: Shoe, size: number) => void;
  onOpenFitAdvisor: (shoe: Shoe) => void;
}

export const CustomizerStudio: React.FC<CustomizerStudioProps> = ({
  baseShoe,
  availableShoes,
  onSelectBaseShoe,
  onAddCustomToCart,
  onOpenFitAdvisor,
}) => {
  // Customization State
  const [upperColor, setUpperColor] = useState('#0ea5e9');
  const [soleColor, setSoleColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [lacesColor, setLacesColor] = useState('#10b981');
  const [cushionColor, setCushionColor] = useState('#06b6d4');
  const [materialFinish, setMaterialFinish] = useState<'matte' | 'gloss' | 'metallic' | 'carbon'>('matte');
  const [customText, setCustomText] = useState('');
  const [carbonUpgrade, setCarbonUpgrade] = useState(true);
  const [insoleUpgrade, setInsoleUpgrade] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number>(10);
  const [activePartTab, setActivePartTab] = useState<'colors' | 'finish' | 'upgrades' | 'text'>('colors');

  // Palette colors for sneaker parts
  const colorPalette = [
    { name: 'Volt Blue', hex: '#0ea5e9' },
    { name: 'Neon Emerald', hex: '#10b981' },
    { name: 'Cyber Crimson', hex: '#ef4444' },
    { name: 'Hyper Violet', hex: '#8b5cf6' },
    { name: 'Solar Amber', hex: '#f59e0b' },
    { name: 'Glacier White', hex: '#ffffff' },
    { name: 'Obsidian Black', hex: '#09090b' },
    { name: 'Charcoal Grey', hex: '#334155' },
    { name: 'Hot Magenta', hex: '#ec4899' },
    { name: 'Tokyo Teal', hex: '#0d9488' },
  ];

  // Designer Colorway Presets
  const presetThemes = [
    {
      name: 'Cyberpunk Neon',
      upper: '#8b5cf6',
      sole: '#09090b',
      accent: '#06b6d4',
      laces: '#ec4899',
      cushion: '#a855f7',
      finish: 'gloss' as const,
    },
    {
      name: 'Tokyo Volt',
      upper: '#0ea5e9',
      sole: '#ffffff',
      accent: '#10b981',
      laces: '#10b981',
      cushion: '#06b6d4',
      finish: 'matte' as const,
    },
    {
      name: 'Obsidian 24K',
      upper: '#0f172a',
      sole: '#020617',
      accent: '#f59e0b',
      laces: '#eab308',
      cushion: '#fbbf24',
      finish: 'metallic' as const,
    },
    {
      name: 'Desert Alpine',
      upper: '#d4c5b9',
      sole: '#27272a',
      accent: '#15803d',
      laces: '#ea580c',
      cushion: '#059669',
      finish: 'carbon' as const,
    },
    {
      name: 'Panda Mono',
      upper: '#ffffff',
      sole: '#000000',
      accent: '#171717',
      laces: '#000000',
      cushion: '#38bdf8',
      finish: 'matte' as const,
    },
  ];

  const applyPreset = (preset: typeof presetThemes[0]) => {
    setUpperColor(preset.upper);
    setSoleColor(preset.sole);
    setAccentColor(preset.accent);
    setLacesColor(preset.laces);
    setCushionColor(preset.cushion);
    setMaterialFinish(preset.finish);
  };

  // Price Calculation
  let basePrice = baseShoe.price;
  if (materialFinish === 'metallic') basePrice += 25;
  if (materialFinish === 'carbon') basePrice += 40;
  if (materialFinish === 'gloss') basePrice += 15;
  if (carbonUpgrade) basePrice += 35;
  if (insoleUpgrade) basePrice += 20;
  if (customText.trim().length > 0) basePrice += 15;

  const handleOrderCustom = () => {
    const config: CustomizationConfig = {
      baseShoeId: baseShoe.id,
      baseShoeName: baseShoe.name,
      upperColor,
      soleColor,
      accentColor,
      lacesColor,
      cushionColor,
      materialFinish,
      customText,
      carbonPlateUpgrade: carbonUpgrade,
      orthoticInsoleUpgrade: insoleUpgrade,
      calculatedPrice: basePrice,
    };
    onAddCustomToCart(config, baseShoe, selectedSize);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>WebGL 3D Digital Twin Studio</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Footwear Customizer & Lab
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Design your 1-of-1 bespoke athletic footwear. Every component manufactured to your specification.
          </p>
        </div>

        {/* Base Model Selector */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium">Model:</span>
          <select
            value={baseShoe.id}
            onChange={(e) => {
              const found = availableShoes.find(s => s.id === e.target.value);
              if (found) onSelectBaseShoe(found);
            }}
            className="py-1.5 px-3 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
          >
            {availableShoes.map((shoe) => (
              <option key={shoe.id} value={shoe.id}>
                {shoe.name} ({shoe.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Center: Interactive 3D Canvas */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative">
            <ThreeShoeViewer
              upperColor={upperColor}
              soleColor={soleColor}
              accentColor={accentColor}
              lacesColor={lacesColor}
              cushionColor={cushionColor}
              materialFinish={materialFinish}
              className="h-[460px] sm:h-[520px] w-full"
              autoRotateDefault={false}
              interactiveHotspots={true}
            />

            {/* Custom Monogram Overlay Tag */}
            {customText.trim() && (
              <div className="absolute bottom-16 right-6 z-20 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md shadow-lg">
                Laser ID: <span className="font-bold tracking-widest text-white uppercase">{customText}</span>
              </div>
            )}
          </div>

          {/* Quick Preset Themes Carousel */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Designer Colorway Presets
              </span>
              <span className="text-[11px] text-slate-500">1-Click Apply</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {presetThemes.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap"
                >
                  <div className="flex -space-x-1">
                    <span className="w-3 h-3 rounded-full border border-slate-900" style={{ backgroundColor: preset.upper }} />
                    <span className="w-3 h-3 rounded-full border border-slate-900" style={{ backgroundColor: preset.accent }} />
                    <span className="w-3 h-3 rounded-full border border-slate-900" style={{ backgroundColor: preset.sole }} />
                  </div>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customizer Controls Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
            
            {/* Control Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setActivePartTab('colors')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activePartTab === 'colors'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Colors & Parts
              </button>
              <button
                type="button"
                onClick={() => setActivePartTab('finish')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activePartTab === 'finish'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Finish
              </button>
              <button
                type="button"
                onClick={() => setActivePartTab('upgrades')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activePartTab === 'upgrades'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Upgrades
              </button>
              <button
                type="button"
                onClick={() => setActivePartTab('text')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activePartTab === 'text'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Laser ID
              </button>
            </div>

            {/* TAB 1: COLORS */}
            {activePartTab === 'colors' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Upper Knit */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-300">Upper VaporWeave Knit</span>
                    <span className="font-mono text-cyan-400 text-[11px]">{upperColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorPalette.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setUpperColor(c.hex)}
                        className={`w-7 h-7 rounded-xl border-2 transition-all ${
                          upperColor === c.hex ? 'border-white scale-110 shadow-lg shadow-cyan-500/40' : 'border-slate-800 hover:border-slate-600'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Accent Bolt Stripe */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-300">Aerodynamic Lightning Swoosh</span>
                    <span className="font-mono text-emerald-400 text-[11px]">{accentColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorPalette.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setAccentColor(c.hex)}
                        className={`w-7 h-7 rounded-xl border-2 transition-all ${
                          accentColor === c.hex ? 'border-white scale-110 shadow-lg shadow-emerald-500/40' : 'border-slate-800 hover:border-slate-600'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Midsole / Outsole */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-300">Midsole Chassis & Sole</span>
                    <span className="font-mono text-slate-400 text-[11px]">{soleColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorPalette.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSoleColor(c.hex)}
                        className={`w-7 h-7 rounded-xl border-2 transition-all ${
                          soleColor === c.hex ? 'border-white scale-110 shadow-lg shadow-blue-500/40' : 'border-slate-800 hover:border-slate-600'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Laces */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-300">Dynamic Laces</span>
                    <span className="font-mono text-slate-400 text-[11px]">{lacesColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorPalette.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setLacesColor(c.hex)}
                        className={`w-7 h-7 rounded-xl border-2 transition-all ${
                          lacesColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-slate-800 hover:border-slate-600'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Nitrogen Cushion Glow */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-300">Nitrogen Cushion Chamber Pod</span>
                    <span className="font-mono text-cyan-400 text-[11px]">{cushionColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorPalette.slice(0, 6).map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setCushionColor(c.hex)}
                        className={`w-7 h-7 rounded-xl border-2 transition-all ${
                          cushionColor === c.hex ? 'border-white scale-110 shadow-lg shadow-cyan-500/50' : 'border-slate-800 hover:border-slate-600'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MATERIAL FINISH */}
            {activePartTab === 'finish' && (
              <div className="space-y-3 animate-fadeIn">
                {[
                  { id: 'matte', name: 'Matte Bio-Knit', price: 0, desc: 'Natural soft matte woven texture with zero glare.' },
                  { id: 'gloss', name: 'High-Gloss Vapor Glaze', price: 15, desc: 'Lustrous clear-coat protective water-shedding seal.' },
                  { id: 'metallic', name: 'Chameleon Metallic Foil', price: 25, desc: 'Subtle color-shifting iridescence under direct sunlight.' },
                  { id: 'carbon', name: '3K Structural Carbon Fiber', price: 40, desc: 'Aerospace grade woven carbon fiber finish on chassis.' },
                ].map((fin) => (
                  <div
                    key={fin.id}
                    onClick={() => setMaterialFinish(fin.id as any)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      materialFinish === fin.id
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{fin.name}</span>
                      <span className="text-xs font-mono text-cyan-400">
                        {fin.price === 0 ? 'Included' : `+${formatCurrency(fin.price)}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{fin.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: UPGRADES */}
            {activePartTab === 'upgrades' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Carbon Plate */}
                <div 
                  onClick={() => setCarbonUpgrade(!carbonUpgrade)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    carbonUpgrade
                      ? 'bg-blue-950/40 border-blue-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${carbonUpgrade ? 'text-blue-400' : 'text-slate-500'}`} />
                      <span className="font-semibold text-xs">Propulsion Carbon Blade Plate</span>
                    </div>
                    <span className="text-xs font-mono text-blue-400">+${35}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Full-length curved carbon fiber spring plate that delivers 4.2% faster toe-off mechanics.
                  </p>
                </div>

                {/* Orthotic Insoles */}
                <div 
                  onClick={() => setInsoleUpgrade(!insoleUpgrade)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    insoleUpgrade
                      ? 'bg-emerald-950/40 border-emerald-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`w-4 h-4 ${insoleUpgrade ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="font-semibold text-xs">OrthoStride™ Memory Gel Insole</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">+${20}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Anatomical heel cup with dual-layer slow-rebound viscoelastic polymer for plantar relief.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: LASER ID */}
            {activePartTab === 'text' && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Laser Engraved Monogram / Text (+${15})
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                    placeholder="e.g. SPEED, 2026, RUNNER"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs uppercase tracking-widest focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                    <span>Etched onto the carbon fiber heel stabilizer</span>
                    <span>{customText.length}/10 chars</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-cyan-400 mb-1">Authenticity Laser Guarantee</div>
                  Each custom pair is individually serialized in our Oregon digital lab and logged on the brand blockchain register.
                </div>
              </div>
            )}

            {/* Size Selector for Custom Pair */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span>Custom Build US Size:</span>
                <button
                  type="button"
                  onClick={() => onOpenFitAdvisor(baseShoe)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 text-[11px]"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Verify Sizing with AI</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-2.5 py-1.5 text-xs font-mono rounded-xl transition-all ${
                      selectedSize === size
                        ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Checkout Action */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Custom Build Total</span>
                <span className="font-display font-extrabold text-2xl text-white">
                  {formatCurrency(basePrice)}
                </span>
                <span className="text-[10px] text-cyan-400 block font-mono">Build time: ~5 business days</span>
              </div>

              <button
                type="button"
                onClick={handleOrderCustom}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 hover:shadow-cyan-600/50 transition-all transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Custom Pair</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
