import React, { useState, useEffect, useMemo } from 'react';
import { PRODUCTS } from './data/products';
import { Product, CartItem, Order, User, PaymentSettings, Category } from './types';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { UpiPaymentModal } from './components/UpiPaymentModal';
import { ShopOwnerPortal } from './components/ShopOwnerPortal';
import { DeliveryPartnerPortal } from './components/DeliveryPartnerPortal';
import { AiRecipeModal } from './components/AiRecipeModal';
import { VoiceModal } from './components/VoiceModal';
import { MobileShareModal } from './components/MobileShareModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import confetti from 'canvas-confetti';
import { Sparkles, ShoppingBag, Truck, Store, Filter, Tag, CheckCircle2, ChevronRight, X } from 'lucide-react';

const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Items', emoji: '🛒' },
  { id: 'tea', name: 'Beverages & Teas', emoji: '☕' },
  { id: 'staples', name: 'Flour & Staples', emoji: '🌾' },
  { id: 'oil', name: 'Edible Oils & Ghee', emoji: '🛢️' },
  { id: 'instant', name: 'Noodles & Instant', emoji: '🍜' },
  { id: 'clean', name: 'Soaps & Detergents', emoji: '🧼' },
  { id: 'spices', name: 'Spices & Masalas', emoji: '🌶️' },
  { id: 'dairy', name: 'Dairy & Milks', emoji: '🥛' }
];

export function App() {
  // App Navigation & Role State
  const [activeTab, setActiveTab] = useState<'customer' | 'shopowner' | 'delivery'>('customer');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedHub, setSelectedHub] = useState('Velachery');

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'savings'>('popular');

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('unga_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Coupons State
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  // Orders State (Live orders synchronized with server)
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    storeEmail: 'orders@ungamarket.com',
    supportEmail: 'support@ungamarket.com',
    storePin: '1234',
    upiVpa: 'jay.pratap.madhavan@okaxis',
    payeeName: 'Jay Prathap',
    gpayPhone: '9840123456',
    phonepeNumber: '9840123456',
    bankName: 'HDFC Bank / Axis Bank',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    instructions: 'Direct wholesale remittance to shop owner'
  });

  // Modal Open States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpiPayOpen, setIsUpiPayOpen] = useState(false);
  const [isAiRecipeOpen, setIsAiRecipeOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isMobileShareOpen, setIsMobileShareOpen] = useState(false);
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (text: string, type: 'ok' | 'err' = 'ok') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('unga_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Fetch initial orders & payment settings from backend
  const fetchOrdersAndSettings = async () => {
    try {
      const [ordersRes, settingsRes] = await Promise.all([
        fetch('/api/orders').catch(() => null),
        fetch('/api/shopowner/payment-settings').catch(() => null)
      ]);

      if (ordersRes && ordersRes.ok) {
        const oData = await ordersRes.json();
        if (oData.success && Array.isArray(oData.orders)) {
          setOrders(oData.orders);
        }
      }

      if (settingsRes && settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.success && sData.settings) {
          setPaymentSettings(sData.settings);
        }
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    }
  };

  useEffect(() => {
    fetchOrdersAndSettings();
    const interval = setInterval(fetchOrdersAndSettings, 15000);
    return () => clearInterval(interval);
  }, []);

  // Cart Calculations
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.product.p * i.qty, 0),
    [cart]
  );
  const isFreeDelivery = cartTotal >= 499 || couponCode === 'FREEDEL';
  const deliveryFee = isFreeDelivery || cartTotal === 0 ? 0 : 29;
  const finalPayTotal = Math.max(0, cartTotal - couponDiscount + deliveryFee);

  // Cart Handlers
  const handleUpdateQty = (product: Product, delta: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx === -1) {
        if (delta > 0) {
          showToast(`Added 1x ${product.n} to wholesale cart ✓`);
          return [...prev, { product, qty: delta }];
        }
        return prev;
      }
      const newQty = prev[idx].qty + delta;
      if (newQty <= 0) {
        showToast(`Removed ${product.n} from cart`);
        return prev.filter((_, i) => i !== idx);
      }
      const updated = [...prev];
      updated[idx] = { ...updated[idx], qty: newQty };
      return updated;
    });
  };

  const handleAddMultiple = (items: { product: Product; qty: number }[]) => {
    setCart((prev) => {
      let next = [...prev];
      items.forEach((it) => {
        const idx = next.findIndex((i) => i.product.id === it.product.id);
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + it.qty };
        } else {
          next.push(it);
        }
      });
      return next;
    });
    showToast(`Added ${items.length} AI recipe ingredients to wholesale cart! ✓`);
    setIsCartOpen(true);
  };

  const handleClearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponDiscount(0);
  };

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartTotal })
      });
      const data = await res.json();
      if (data.success) {
        setCouponCode(data.code);
        setCouponDiscount(data.discount || 0);
        showToast(data.message || 'Coupon applied!', 'ok');
        return true;
      }
    } catch (e) {}

    // Local fallback for offline/preview
    const c = code.toUpperCase();
    if (c === 'WELCOME20') {
      setCouponCode('WELCOME20');
      setCouponDiscount(50);
      return true;
    }
    if (c === 'UNGA10') {
      setCouponCode('UNGA10');
      setCouponDiscount(Math.round(cartTotal * 0.1));
      return true;
    }
    if (c === 'FREEDEL') {
      setCouponCode('FREEDEL');
      setCouponDiscount(0);
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    showToast('Coupon removed');
  };

  // Order Placement & Payment flow
  const handleOrderSuccess = (orderData: Order, payMethod: 'gpay' | 'upi' | 'cod') => {
    setLastPlacedOrder(orderData);
    setOrders((prev) => [orderData, ...prev]);
    setIsCheckoutOpen(false);

    if (payMethod === 'gpay' || payMethod === 'upi') {
      setIsUpiPayOpen(true);
    } else {
      // Cash on Delivery success
      handleClearCart();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      showToast(`🎉 Order #${orderData.id} placed successfully!`);
      setTrackingOrder(orderData);
    }
  };

  const handlePaymentConfirmed = async (orderId: string, utr?: string) => {
    try {
      await fetch('/api/confirm-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, utr })
      });
    } catch (e) {}

    setIsUpiPayOpen(false);
    handleClearCart();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    showToast(`🎉 Payment confirmed for Order #${orderId}! Express packing initiated.`);
    if (lastPlacedOrder) {
      setTrackingOrder(lastPlacedOrder);
    }
  };

  // Status updates in Shop Owner / Delivery Boy portals
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      showToast(`Order #${orderId} marked as ${status} ✓`);
    } catch (e) {
      showToast('Failed to update status', 'err');
    }
  };

  const handleSavePaymentSettings = async (newSettings: PaymentSettings): Promise<boolean> => {
    try {
      const res = await fetch('/api/shopowner/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newSettings.storePin, settings: newSettings })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSettings(newSettings);
        showToast('Gateway settings saved ✓');
        return true;
      }
    } catch (e) {}
    setPaymentSettings(newSettings);
    return true;
  };

  // Filtered Products Catalog
  const brandsList = useMemo(() => {
    const brands = new Set<string>();
    PRODUCTS.forEach((p) => {
      if (p.b) brands.add(p.b);
    });
    return Array.from(brands).sort();
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (selectedCategory !== 'all' && p.c.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedBrand !== 'all' && p.b !== selectedBrand) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.n.toLowerCase().includes(q) ||
          p.b.toLowerCase().includes(q) ||
          p.c.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.p - b.p;
      if (sortBy === 'price-desc') return b.p - a.p;
      if (sortBy === 'savings') return b.disc - a.disc;
      return 0;
    });
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between pb-20 lg:pb-6">
      {/* Toast Banner */}
      {toastMsg && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
            toastMsg.type === 'ok' ? 'bg-emerald-800 text-white' : 'bg-red-700 text-white'
          }`}
        >
          <CheckCircle2 size={16} />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Main Responsive Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiRecipe={() => setIsAiRecipeOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenMobileShare={() => setIsMobileShareOpen(true)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => {}}
        onLogout={() => setCurrentUser(null)}
        selectedHub={selectedHub}
        onChangeHub={setSelectedHub}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4">
        {/* Customer Storefront View */}
        {activeTab === 'customer' && (
          <div className="space-y-4">
            {/* Quick Hero Banner / Highlight */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-emerald-600/60 border border-emerald-400/30 text-emerald-100 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles size={12} />
                  <span>Direct Distributor Wholesale</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Chennai's Wholesale FMCG Grocery Hub
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl font-medium">
                  Flat 20% discount on Tata Tea, Maggi, Fortune Oil, Aashirvaad, Surf Excel &amp; 1,600+ FMCG brands. Free 10–15 min express doorstep delivery.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiRecipeOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Sparkles size={15} />
                  <span>AI Recipe-to-Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileShareOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
                >
                  📱 Share / Mobile
                </button>
              </div>
            </div>

            {/* Categories Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedBrand('all');
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-xs scale-102'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Sub-Filters: Brands & Sort */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="font-extrabold text-slate-400 uppercase text-[11px]">Brand:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-slate-50 font-bold text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none text-xs cursor-pointer"
                >
                  <option value="all">All Brands ({brandsList.length})</option>
                  {brandsList.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <div className="text-slate-500 font-bold text-[11px]">
                  Showing <b>{filteredProducts.length}</b> wholesale products
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-400 uppercase text-[11px]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-slate-50 font-bold text-slate-800 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none text-xs cursor-pointer"
                  >
                    <option value="popular">Popularity</option>
                    <option value="savings">Max Savings (₹)</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <div className="text-4xl">🔍</div>
                <h3 className="font-extrabold text-slate-800 text-base">No wholesale items match your search</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try checking spelling or reset category filters to view our full 1,600+ FMCG catalog.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                  }}
                  className="bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredProducts.map((prod) => {
                  const cartItem = cart.find((i) => i.product.id === prod.id);
                  return (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      qty={cartItem ? cartItem.qty : 0}
                      onUpdateQty={handleUpdateQty}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Shop Owner Portal View */}
        {activeTab === 'shopowner' && (
          <ShopOwnerPortal
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRefreshOrders={fetchOrdersAndSettings}
            paymentSettings={paymentSettings}
            onSavePaymentSettings={handleSavePaymentSettings}
          />
        )}

        {/* Delivery Partner Portal View */}
        {activeTab === 'delivery' && (
          <DeliveryPartnerPortal
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRefreshOrders={fetchOrdersAndSettings}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMobileShare={() => setIsMobileShareOpen(true)}
        onOpenCategories={() => setIsCategoriesDrawerOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onClearCart={handleClearCart}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        couponCode={couponCode}
        couponDiscount={couponDiscount}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        subtotal={cartTotal}
        discount={couponDiscount}
        deliveryFee={deliveryFee}
        finalTotal={finalPayTotal}
        couponCode={couponCode}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* UPI / GPay Dynamic QR Modal */}
      <UpiPaymentModal
        isOpen={isUpiPayOpen}
        onClose={() => setIsUpiPayOpen(false)}
        orderId={lastPlacedOrder?.id || 'ORD1001'}
        amount={finalPayTotal}
        onPaymentConfirmed={handlePaymentConfirmed}
        upiVpa={paymentSettings.upiVpa}
        payeeName={paymentSettings.payeeName}
        gpayPhone={paymentSettings.gpayPhone}
      />

      {/* AI Recipe Assistant Modal */}
      <AiRecipeModal
        isOpen={isAiRecipeOpen}
        onClose={() => setIsAiRecipeOpen(false)}
        products={PRODUCTS}
        onAddMultipleToCart={handleAddMultiple}
      />

      {/* Voice Assistant Modal */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscript={(q) => setSearchQuery(q)}
      />

      {/* Mobile Testing & Share Modal */}
      <MobileShareModal
        isOpen={isMobileShareOpen}
        onClose={() => setIsMobileShareOpen(false)}
      />

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
        order={trackingOrder}
      />
    </div>
  );
}
