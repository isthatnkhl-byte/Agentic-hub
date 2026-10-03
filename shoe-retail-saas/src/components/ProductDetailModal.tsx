import React, { useState } from 'react';
import { 
  Shoe, 
  ShoeColorway 
} from '../types';
import { ThreeShoeViewer } from './ThreeShoeViewer';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Sparkles, 
  Sliders, 
  Check, 
  ShieldCheck, 
  RotateCcw,
  Zap,
  Leaf
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface ProductDetailModalProps {
  shoe: Shoe | null;
  initialColor?: ShoeColorway;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (shoe: Shoe, color: ShoeColorway, size: number) => void;
  onOpenCustomizer: (shoe: Shoe) => void;
  onOpenFitAdvisor: (shoe: Shoe) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  shoe,
  initialColor,
  isOpen,
  onClose,
  onAddToCart,
  onOpenCustomizer,
  onOpenFitAdvisor,
}) => {
  if (!isOpen || !shoe) return null;

  const [selectedColor, setSelectedColor] = useState<ShoeColorway>(initialColor || shoe.colors[0]);
  const [selectedSize, setSelectedSize] = useState<number>(shoe.sizes[0] || 9.5);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAdd = () => {
    onAddToCart(shoe, selectedColor, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const currentStock = shoe.stockPerSize[selectedSize] ?? 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: 3D Interactive Canvas */}
          <div className="lg:col-span-6 bg-slate-950 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {shoe.category}
                </span>
                {shoe.badge && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {shoe.badge}
                  </span>
                )}
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">{shoe.name}</h2>
            </div>

            {/* 3D Viewer */}
            <div className="my-4">
              <ThreeShoeViewer
                upperColor={selectedColor.hex}
                soleColor={selectedColor.soleHex}
                accentColor={selectedColor.accentHex}
                lacesColor={selectedColor.lacesHex}
                className="h-[340px] w-full"
                autoRotateDefault={true}
              />
            </div>

            {/* Color selector strip */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">
                Colorway: <span className="text-white font-bold">{selectedColor.name}</span>
              </span>
              <div className="flex items-center gap-2">
                {shoe.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all p-0.5 ${
                      selectedColor.name === c.name
                        ? 'border-white scale-110 shadow-lg shadow-blue-500/40'
                        : 'border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Specs, Sizing & Actions */}
          <div className="lg:col-span-6 p-6 sm:p-8 space-y-6 bg-slate-900/90">
            
            {/* Price & Rating */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-black text-3xl text-white">
                    {formatCurrency(shoe.price)}
                  </span>
                  {shoe.originalPrice && (
                    <span className="text-sm text-slate-500 line-through">
                      {formatCurrency(shoe.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                  ✓ Free 2-Day Carbon Neutral Shipping
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-sm text-white">{shoe.rating}</span>
                <span className="text-xs text-slate-400">({shoe.reviewsCount} reviews)</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {shoe.description}
            </p>

            {/* Sizing Picker */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span className="font-semibold">Select US Size</span>
                <button
                  type="button"
                  onClick={() => onOpenFitAdvisor(shoe)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SmartFit™ Size Recommender</span>
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {shoe.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 text-xs font-mono rounded-xl transition-all ${
                      selectedSize === size
                        ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                        : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-amber-400 mt-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>{currentStock} units remaining in warehouse for US {selectedSize}</span>
              </div>
            </div>

            {/* Tech Specs Matrix */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Anatomical Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Chassis Weight</span>
                  <span className="text-slate-200 font-medium">{shoe.techSpecs.weight}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Cushioning Platform</span>
                  <span className="text-slate-200 font-medium">{shoe.techSpecs.cushioning}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Heel-to-Toe Drop</span>
                  <span className="text-slate-200 font-medium">{shoe.techSpecs.drop}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Propulsion Element</span>
                  <span className="text-slate-200 font-medium">
                    {shoe.techSpecs.carbonPlate ? '⚡ Full Carbon Plate' : 'EVA Rocker'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs transition-all ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag — {formatCurrency(shoe.price)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCustomizer(shoe);
                }}
                className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-semibold text-xs transition-all"
              >
                <Sliders className="w-4 h-4" />
                <span>Custom Studio</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
