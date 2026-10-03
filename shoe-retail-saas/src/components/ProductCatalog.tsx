import React, { useState, useMemo } from 'react';
import { 
  Shoe, 
  ShoeCategory, 
  ShoeColorway 
} from '../types';
import { ProductCard } from './ProductCard';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowUpDown, 
  Filter, 
  RotateCcw 
} from 'lucide-react';

interface ProductCatalogProps {
  shoes: Shoe[];
  onQuickView: (shoe: Shoe, selectedColor: ShoeColorway) => void;
  onAddToCart: (shoe: Shoe, color: ShoeColorway, size: number) => void;
  onOpenCustomizerWithShoe: (shoe: Shoe) => void;
  onOpenFitAdvisor: (shoe?: Shoe) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  shoes,
  onQuickView,
  onAddToCart,
  onOpenCustomizerWithShoe,
  onOpenFitAdvisor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ShoeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'hype' | 'price-asc' | 'price-desc' | 'rating'>('hype');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<number | null>(null);

  const categories: ShoeCategory[] = [
    'All',
    'Aeroknit Running',
    'Cyber Streetwear',
    'Trail & Outdoor',
    'Court Performance',
    'Eco-Recycled Luxe',
  ];

  const availableSizes = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13];

  const filteredShoes = useMemo(() => {
    return shoes.filter((shoe) => {
      // Category match
      if (selectedCategory !== 'All' && shoe.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = shoe.name.toLowerCase().includes(query);
        const matchesTagline = shoe.tagline.toLowerCase().includes(query);
        const matchesCategory = shoe.category.toLowerCase().includes(query);
        if (!matchesName && !matchesTagline && !matchesCategory) return false;
      }
      // Size filter match
      if (selectedSizeFilter !== null) {
        if (!shoe.sizes.includes(selectedSizeFilter)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'hype') return b.hypeScore - a.hypeScore;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [shoes, selectedCategory, searchQuery, sortBy, selectedSizeFilter]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedSizeFilter(null);
    setSortBy('hype');
  };

  return (
    <section id="catalog-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Curated Release Drops
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Footwear Catalog & Fleet
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Precision-molded outsoles, biomechanically validated propulsion plates, and zero-drop trail geometries.
          </p>
        </div>

        {/* AI Fit Assistant Banner Strip */}
        <div 
          onClick={() => onOpenFitAdvisor()}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-blue-500/10 border border-emerald-500/30 hover:border-emerald-500/50 cursor-pointer backdrop-blur-md transition-all group"
        >
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>SmartFit™ AI Sizing Predictor</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">99.2% Accuracy</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Never return a pair. Scan foot dimensions in 30 seconds &rarr;
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        {categories.map((cat) => {
          const count = cat === 'All' ? shoes.length : shoes.filter(s => s.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search, Size Filter & Sorting Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md mb-8">
        
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by model, tech spec, or style..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              &times;
            </button>
          )}
        </div>

        {/* Size Filter Selector */}
        <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Size:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSizeFilter(null)}
            className={`px-2 py-1 text-[11px] rounded-lg font-mono ${
              selectedSizeFilter === null 
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          {availableSizes.slice(0, 7).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSizeFilter(selectedSizeFilter === size ? null : size)}
              className={`px-2 py-1 text-[11px] rounded-lg font-mono transition-all ${
                selectedSizeFilter === size
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="md:col-span-3 flex items-center justify-end gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full md:w-auto py-2 px-3 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="hype">Hype Index (Highest)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated (Stars)</option>
          </select>
        </div>

      </div>

      {/* Shoes Grid */}
      {filteredShoes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredShoes.map((shoe) => (
            <ProductCard
              key={shoe.id}
              shoe={shoe}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              onOpenCustomizerWithShoe={onOpenCustomizerWithShoe}
              onOpenFitAdvisor={() => onOpenFitAdvisor(shoe)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">No footwear models matched</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, clear the size filter, or browse all categories.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

    </section>
  );
};
