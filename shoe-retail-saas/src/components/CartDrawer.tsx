import React, { useState } from 'react';
import { 
  CartItem 
} from '../types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  Tag, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenCheckout: (discountAmount: number, promoCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
}) => {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscountPct, setPromoDiscountPct] = useState(0);
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  // Subtotal calculation
  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.isCustom && item.customConfig 
      ? item.customConfig.calculatedPrice 
      : item.shoe.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  // Free shipping threshold ($150)
  const freeShippingThreshold = 150;
  const isFreeShipping = subtotal >= freeShippingThreshold || appliedPromo === 'KICKSFREE';
  const shippingAmount = cartItems.length === 0 || isFreeShipping ? 0 : 15;
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Discount calculation
  let discountAmount = 0;
  if (promoDiscountPct > 0) {
    discountAmount = (subtotal * promoDiscountPct) / 100;
  } else if (appliedPromo === 'FOUNDER') {
    discountAmount = Math.min(50, subtotal);
  }

  const tax = Math.round((subtotal - discountAmount) * 0.08 * 100) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingAmount + tax);

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();

    if (code === 'STRIDE20') {
      setAppliedPromo('STRIDE20');
      setPromoDiscountPct(20);
    } else if (code === 'KICKSFREE') {
      setAppliedPromo('KICKSFREE');
      setPromoDiscountPct(0);
    } else if (code === 'FOUNDER') {
      setAppliedPromo('FOUNDER');
      setPromoDiscountPct(0);
    } else {
      setPromoError('Invalid promo code. Try "STRIDE20" for 20% off.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              <h3 className="font-display font-bold text-lg text-white">Your Footwear Bag</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">
                {isFreeShipping ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked Free Worldwide Carbon-Neutral Shipping!
                  </span>
                ) : (
                  <span>
                    Add <span className="font-bold text-white">{formatCurrency(freeShippingThreshold - subtotal)}</span> more for Free Shipping
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-slate-400">{shippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-display font-semibold text-white">Your bag is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse our high-performance fleet or configure a bespoke pair in the 3D Customizer Studio.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
                >
                  Explore Drops
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemPrice = item.isCustom && item.customConfig
                  ? item.customConfig.calculatedPrice
                  : item.shoe.price;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-4 hover:border-slate-700/80 transition-all"
                  >
                    {/* Color Swatch / Visual Chip */}
                    <div className="relative w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      <div 
                        className="w-10 h-10 rounded-full blur-md opacity-70"
                        style={{ backgroundColor: item.selectedColor.hex }}
                      />
                      <div 
                        className="absolute inset-2 rounded-lg border-2 border-slate-700"
                        style={{ backgroundColor: item.selectedColor.hex }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-xs text-white truncate">
                          {item.shoe.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Customization Details Pill */}
                      {item.isCustom && item.customConfig && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            3D Bespoke Build
                          </span>
                          {item.customConfig.customText && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-300">
                              Laser: {item.customConfig.customText}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Size: <strong className="text-white">US {item.selectedSize}</strong></span>
                        <span>•</span>
                        <span className="truncate">{item.selectedColor.name}</span>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-white">
                          {formatCurrency(itemPrice * item.quantity)}
                        </span>

                        <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono text-white px-1.5">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Checkout Trigger */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-900/90 space-y-4">
              
              {/* Promo code input */}
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="Promo Code (e.g. STRIDE20)"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    Code &ldquo;{appliedPromo}&rdquo; applied successfully!
                  </div>
                )}
                {promoError && (
                  <div className="text-[11px] text-rose-400 mt-1">
                    {promoError}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-mono">
                    <span>Discount ({appliedPromo})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Carbon-Neutral Shipping</span>
                  <span className="font-mono text-white">
                    {shippingAmount === 0 ? 'FREE' : formatCurrency(shippingAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Tax</span>
                  <span className="font-mono text-white">{formatCurrency(tax)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total</span>
                  <span className="font-display font-extrabold text-lg text-white">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCheckout(discountAmount, appliedPromo || '');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-0.5"
              >
                <span>Proceed to Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>256-Bit Encrypted Footwear Checkout • 30-Day Zero Hassle Guarantee</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
