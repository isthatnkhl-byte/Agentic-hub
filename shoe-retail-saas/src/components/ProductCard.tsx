import React, { useState } from 'react';
import { 
  Shoe, 
  ShoeColorway 
} from '../types';
import { ShoeSilhouetteSVG } from './ShoeSilhouetteSVG';
import { 
  Star, 
  Zap, 
  Sparkles, 
  Eye, 
  Sliders, 
  ShoppingBag, 
  Check, 
  Flame 
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface ProductCardProps {
  shoe: Shoe;
  onQuickView: (shoe: Shoe, selectedColor: ShoeColorway) => void;
  onAddToCart: (shoe: Shoe, color: ShoeColorway, size: number) => void;
  onOpenCustomizerWithShoe: (shoe: Shoe) => void;
  onOpenFitAdvisor: (shoe: Shoe) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  shoe,
  onQuickView,
  onAddToCart,
  onOpenCustomizerWithShoe,
  onOpenFitAdvisor,
}) => {
  const [selectedColor, setSelectedColor] = useState<ShoeColorway>(shoe.colors[0]);
  const [selectedSize, setSelectedSize] = useState<number>(shoe.sizes[Math.floor(shoe.sizes.length / 2)] || 9.5);
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleQuickAdd = () => {
    onAddToCart(shoe, selectedColor, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const currentStockForSize = shoe.stockPerSize[selectedSize] ?? 5;
  const isLowStock = currentStockForSize <= 6;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden"
    >
      {/* Top Badge Strip */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {shoe.badge && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${
              shoe.badge === 'Limited Drop'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : shoe.badge === 'Carbon Plate'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : shoe.badge === 'Eco Edition'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {shoe.badge}
            </span>
          )}
        </div>

        {/* Hype Score Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono font-medium text-slate-300 pointer-events-auto">
          <Flame className="w-3 h-3 text-orange-400" />
          <span>Hype {shoe.hypeScore}%</span>
        </div>
      </div>

      {/* Sneaker Visual Container */}
      <div className="relative pt-6 px-4 bg-gradient-to-b from-slate-900/40 via-slate-950/40 to-slate-900/60 cursor-pointer"
        onClick={() => onQuickView(shoe, selectedColor)}
      >
        <ShoeSilhouetteSVG colorway={selectedColor} className="h-56 w-full" />

        {/* Hover Quick View Trigger */}
        <div className={`absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-200 pointer-events-none ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/95 border border-slate-700 text-xs font-semibold text-white shadow-xl pointer-events-auto hover:bg-slate-800 transition-colors">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Quick Inspect 360°</span>
          </div>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-mono text-[11px] text-blue-400 font-medium tracking-wide uppercase">
              {shoe.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-slate-200">{shoe.rating}</span>
              <span className="text-slate-500">({shoe.reviewsCount})</span>
            </div>
          </div>

          {/* Shoe Name & Tagline */}
          <h3 
            onClick={() => onQuickView(shoe, selectedColor)}
            className="font-display font-bold text-lg text-white group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
          >
            {shoe.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {shoe.tagline}
          </p>

          {/* Colorway Swatch Dial */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Color: <span className="text-slate-200 font-medium">{selectedColor.name}</span>
            </span>

            <div className="flex items-center gap-1.5">
              {shoe.colors.map((colorway) => (
                <button
                  key={colorway.name}
                  type="button"
                  onClick={() => setSelectedColor(colorway)}
                  className={`w-5 h-5 rounded-full border-2 transition-all p-0.5 ${
                    selectedColor.name === colorway.name
                      ? 'border-white scale-110 shadow-md shadow-blue-500/40'
                      : 'border-slate-700 hover:border-slate-500 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: colorway.hex }}
                  title={colorway.name}
                />
              ))}
            </div>
          </div>

          {/* Size Selector Strip */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Select US Size:</span>
              <button
                type="button"
                onClick={() => onOpenFitAdvisor(shoe)}
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>SmartFit™ Check</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {shoe.sizes.slice(0, 7).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-1 text-[11px] font-mono rounded-lg transition-all ${
                    selectedSize === size
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                  }`}
                >
                  {size}
                </button>
              ))}
              {shoe.sizes.length > 7 && (
                <button
                  type="button"
                  onClick={() => onQuickView(shoe, selectedColor)}
                  className="px-2 py-1 text-[10px] text-slate-400 hover:text-white"
                >
                  +{shoe.sizes.length - 7} more
                </button>
              )}
            </div>

            {/* Low stock warning */}
            {isLowStock && (
              <div className="mt-1.5 text-[10px] text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Fast selling: only {currentStockForSize} pairs left in size US {selectedSize}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-extrabold text-xl text-white">
                {formatCurrency(shoe.price)}
              </span>
              {shoe.originalPrice && (
                <span className="text-xs text-slate-500 line-through">
                  {formatCurrency(shoe.originalPrice)}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">
              {shoe.returnRate}% Low Return Rate
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenCustomizerWithShoe(shoe)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700/80 hover:border-cyan-500/40 transition-all"
              title="Customize this model in 3D Studio"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleQuickAdd}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                addedAnimation
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
