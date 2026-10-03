import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CartItem } from '../types';
import { formatCurrency, generateTrackingNumber } from '../utils/helpers';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Truck, 
  Lock, 
  Zap, 
  Smartphone,
  ArrowRight
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountAmount: number;
  promoCode: string;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountAmount,
  promoCode,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'crypto'>('card');
  const [trackingId, setTrackingId] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.isCustom && item.customConfig
      ? item.customConfig.calculatedPrice
      : item.shoe.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  const shipping = subtotal >= 150 || promoCode === 'KICKSFREE' ? 0 : 15;
  const tax = Math.round((subtotal - discountAmount) * 0.08 * 100) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping + tax);

  const handleFillDemo = () => {
    setEmail('alex.chen@cyberathlete.io');
    setFirstName('Alex');
    setLastName('Chen');
    setAddress('742 Evergreen Terrace, Suite 400');
    setCity('San Francisco, CA');
    setZip('94107');
    setCardNumber('•••• •••• •••• 4242');
    setCardExp('12/28');
    setCardCvc('884');
  };

  const handleProcessOrder = () => {
    setStep('processing');

    setTimeout(() => {
      const track = generateTrackingNumber();
      setTrackingId(track);
      setStep('success');

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#06b6d4', '#f59e0b', '#ec4899']
        });
      } catch (e) {
        // Fallback gracefully
      }
    }, 1800);
  };

  const handleDone = () => {
    onOrderCompleted();
    onClose();
    setStep('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="font-display font-bold text-white text-base">STRIDE Express Checkout</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              End-to-End Encrypted
            </span>
          </div>

          {step !== 'processing' && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {step === 'checkout' && (
            <div className="space-y-6">
              
              {/* Demo Autofill Banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <span>Want to test the checkout flow instantly?</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                >
                  ⚡ Autofill Demo Persona
                </button>
              </div>

              {/* Payment Method Selector */}
              <div>
                <span className="block text-xs font-semibold text-slate-300 mb-2">Select Express Payment</span>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span>Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === 'apple'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-slate-200" />
                    <span>Apple / Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === 'crypto'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>USDC / Solana</span>
                  </button>
                </div>
              </div>

              {/* Shipping Address Form */}
              <div className="space-y-3">
                <span className="block text-xs font-semibold text-slate-300">Shipping Destination</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email for Digital Receipt & Tracking"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City, State"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="ZIP / Postal Code"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Payment Details */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Card Credentials</span>
                    <span>Visa • Mastercard • Amex</span>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number (4242 4242 ...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      placeholder="MM / YY"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Order Recap */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Footwear Subtotal ({cartItems.length} items)</span>
                  <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-mono">
                    <span>Promo Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Carbon-Neutral Delivery</span>
                  <span className="font-mono text-white">{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Sales Tax</span>
                  <span className="font-mono text-white">{formatCurrency(tax)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount Due</span>
                  <span className="font-display font-extrabold text-lg text-emerald-400">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Complete Action Button */}
              <button
                type="button"
                onClick={handleProcessOrder}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Pay {formatCurrency(grandTotal)} & Confirm Order</span>
              </button>

            </div>
          )}

          {/* STEP 2: PROCESSING */}
          {step === 'processing' && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="font-display font-bold text-lg text-white">
                Validating Payment & Allocating Inventory...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                Cryptographic authentication with STRIDE Cloud Hub...
              </p>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="py-10 text-center space-y-6 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-display font-black text-2xl text-white">
                  Order Successfully Dispatched!
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                  Thank you for shopping with STRIDE. Your footwear has been reserved in our automated warehouse and is currently undergoing optical inspection.
                </p>
              </div>

              {/* Tracking Receipt Card */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tracking Reference:</span>
                  <span className="font-mono font-bold text-cyan-400">{trackingId}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Estimated Delivery:</span>
                  <span className="font-semibold text-white">Thursday, Oct 8 (2-Day Express)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Charged:</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatCurrency(grandTotal)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Carbon-neutral logistics handled by STRIDE Global Air</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDone}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xl shadow-blue-600/30 transition-all inline-flex items-center gap-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
