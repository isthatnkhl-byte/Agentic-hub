import React, { useState } from 'react';
import { 
  Shoe, 
  ShoeColorway, 
  CartItem, 
  ActiveTab, 
  CustomizationConfig, 
  SubscriptionTier, 
  RaffleDrop 
} from './types';
import { INITIAL_SHOES } from './data/mockData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomizerStudio } from './components/CustomizerStudio';
import { SmartFitAdvisorModal } from './components/SmartFitAdvisorModal';
import { SaaSDashboard } from './components/SaaSDashboard';
import { SneakerPassHub } from './components/SneakerPassHub';
import { RaffleLaunchpad } from './components/RaffleLaunchpad';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('storefront');
  const [shoes, setShoes] = useState<Shoe[]>(INITIAL_SHOES);

  // Cart State (Pre-filled with 1 item so the user can immediately experience cart interactions)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'demo-cart-item-1',
      shoe: INITIAL_SHOES[0],
      selectedColor: INITIAL_SHOES[0].colors[0],
      selectedSize: 10,
      quantity: 1,
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modal States
  const [quickViewShoe, setQuickViewShoe] = useState<Shoe | null>(null);
  const [quickViewColor, setQuickViewColor] = useState<ShoeColorway | undefined>(undefined);
  const [isFitAdvisorOpen, setIsFitAdvisorOpen] = useState(false);
  const [fitAdvisorShoe, setFitAdvisorShoe] = useState<Shoe | null>(null);
  const [customizerBaseShoe, setCustomizerBaseShoe] = useState<Shoe>(INITIAL_SHOES[0]);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState('');

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Handlers
  const handleAddToCart = (shoe: Shoe, color: ShoeColorway, size: number) => {
    const existingIndex = cartItems.findIndex(
      (item) => !item.isCustom && item.shoe.id === shoe.id && item.selectedColor.name === color.name && item.selectedSize === size
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        shoe,
        selectedColor: color,
        selectedSize: size,
        quantity: 1,
      };
      setCartItems([...cartItems, newItem]);
    }

    addToast('success', 'Added to Bag', `${shoe.name} (US ${size} - ${color.name}) added to your bag.`);
  };

  const handleAddCustomToCart = (config: CustomizationConfig, shoe: Shoe, size: number) => {
    const customColorway: ShoeColorway = {
      name: `Bespoke 3D ${config.materialFinish.toUpperCase()}`,
      hex: config.upperColor,
      secondaryHex: config.lacesColor,
      accentHex: config.accentColor,
      soleHex: config.soleColor,
      lacesHex: config.lacesColor,
    };

    const newCustomItem: CartItem = {
      id: `custom-${Date.now()}`,
      shoe,
      selectedColor: customColorway,
      selectedSize: size,
      quantity: 1,
      isCustom: true,
      customConfig: config,
    };

    setCartItems([...cartItems, newCustomItem]);
    addToast('success', 'Custom Sneaker Queued', `Custom ${shoe.name} (US ${size}) added to your bag.`);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    addToast('info', 'Item Removed', 'Product removed from your footwear bag.');
  };

  // SaaS Price Updater
  const handleUpdateShoePrice = (shoeId: string, newPrice: number) => {
    setShoes((prev) =>
      prev.map((s) => (s.id === shoeId ? { ...s, price: newPrice } : s))
    );
    addToast('success', 'SKU Updated', `MSRP price updated to $${newPrice} across all sales channels.`);
  };

  // Customizer Launchers
  const handleOpenCustomizerWithShoe = (shoe: Shoe) => {
    setCustomizerBaseShoe(shoe);
    setActiveTab('customizer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fit Advisor Handlers
  const handleOpenFitAdvisor = (shoe?: Shoe) => {
    setFitAdvisorShoe(shoe || null);
    setIsFitAdvisorOpen(true);
  };

  const handleApplySmartFitSize = (recommendedSize: number) => {
    addToast('success', 'SmartFit™ Applied', `Size US ${recommendedSize} saved to active fit profile.`);
  };

  // SneakerPass Subscription Handler
  const handleSubscribePass = (tier: SubscriptionTier, annual: boolean) => {
    addToast('success', 'Membership Active', `You are now subscribed to ${tier.name} (${annual ? 'Annual' : 'Monthly'}).`);
  };

  // Raffle Handler
  const handleEnterRaffle = (drop: RaffleDrop) => {
    addToast('success', 'Raffle Entry Confirmed', `You have been entered into the draw for ${drop.shoeName}.`);
  };

  // Checkout Open
  const handleOpenCheckout = (discountAmount: number, promoCode: string) => {
    setCheckoutDiscount(discountAmount);
    setCheckoutPromoCode(promoCode);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = () => {
    setCartItems([]);
    addToast('success', 'Order Confirmed', 'Your order was placed successfully. Tracking details generated.');
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('storefront');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
        openFitAdvisor={() => handleOpenFitAdvisor()}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {activeTab === 'storefront' && (
          <>
            <HeroSection
              onExploreProducts={scrollToCatalog}
              setActiveTab={setActiveTab}
              openFitAdvisor={() => handleOpenFitAdvisor()}
            />
            <ProductCatalog
              shoes={shoes}
              onQuickView={(shoe, color) => {
                setQuickViewShoe(shoe);
                setQuickViewColor(color);
              }}
              onAddToCart={handleAddToCart}
              onOpenCustomizerWithShoe={handleOpenCustomizerWithShoe}
              onOpenFitAdvisor={handleOpenFitAdvisor}
            />
          </>
        )}

        {activeTab === 'customizer' && (
          <CustomizerStudio
            baseShoe={customizerBaseShoe}
            availableShoes={shoes}
            onSelectBaseShoe={(shoe) => setCustomizerBaseShoe(shoe)}
            onAddCustomToCart={handleAddCustomToCart}
            onOpenFitAdvisor={handleOpenFitAdvisor}
          />
        )}

        {activeTab === 'saas-dashboard' && (
          <SaaSDashboard
            shoes={shoes}
            onUpdateShoePrice={handleUpdateShoePrice}
            onLaunchCustomizer={handleOpenCustomizerWithShoe}
          />
        )}

        {activeTab === 'sneakerpass' && (
          <SneakerPassHub
            onSubscribe={handleSubscribePass}
          />
        )}

        {activeTab === 'raffle' && (
          <RaffleLaunchpad
            onEnterRaffle={handleEnterRaffle}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onSubscribeNewsletter={(email) => {
          addToast('success', 'Subscribed', `Email ${email} added to VIP Drop radar.`);
        }}
      />

      {/* Modals & Slide-overs */}
      <ProductDetailModal
        shoe={quickViewShoe}
        initialColor={quickViewColor}
        isOpen={quickViewShoe !== null}
        onClose={() => setQuickViewShoe(null)}
        onAddToCart={handleAddToCart}
        onOpenCustomizer={handleOpenCustomizerWithShoe}
        onOpenFitAdvisor={handleOpenFitAdvisor}
      />

      <SmartFitAdvisorModal
        shoe={fitAdvisorShoe}
        isOpen={isFitAdvisorOpen}
        onClose={() => setIsFitAdvisorOpen(false)}
        onApplySize={handleApplySmartFitSize}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOpenCheckout={handleOpenCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        discountAmount={checkoutDiscount}
        promoCode={checkoutPromoCode}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Global Toast System */}
      <ToastNotification
        toasts={toasts}
        onDismiss={dismissToast}
      />

    </div>
  );
};

export default App;
