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
import { AuthLoginPage } from './components/AuthLoginPage';
import { AiRecipeModal } from './components/AiRecipeModal';
import { VoiceModal } from './components/VoiceModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import confetti from 'canvas-confetti';
import { Sparkles, ShoppingBag, Truck, Store, Filter, Tag, CheckCircle2, ChevronRight, Zap, Clock, ShieldCheck } from 'lucide-react';
import { LocationState, fetchRealtimeGeolocation, computeDeliveryEta } from './utils/locationEta';

const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Products', emoji: '🛒' },
  { id: 'produce', name: 'Fresh Produce', emoji: '🥬' },
  { id: 'dairy', name: 'Dairy & Bread', emoji: '🥛' },
  { id: 'grocery', name: 'Atta, Rice & Oil', emoji: '🌾' },
  { id: 'beverages', name: 'Tea, Coffee & Drinks', emoji: '☕' },
  { id: 'snacks', name: 'Snacks & Munchies', emoji: '🍪' },
  { id: 'cleaning', name: 'Cleaning & Household', emoji: '🧼' },
  { id: 'personal', name: 'Personal Care', emoji: '🧴' }
];

// Normalize raw orders from backend with safe fallbacks
function normalizeOrder(raw: any): Order {
  const cust = raw?.customer && typeof raw.customer === 'object' ? raw.customer : {};
  const addrStr = raw?.addr || '';
  const addrParts = addrStr.split(',');

  return {
    id: raw?.id || `UM${Math.floor(1000 + Math.random() * 9000)}`,
    date: raw?.date || (raw?.at ? new Date(raw.at).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'medium' }) : new Date().toLocaleTimeString()),
    customer: {
      name: cust.name || (typeof raw?.customer === 'string' ? raw.customer : 'Valued Customer'),
      phone: cust.phone || raw?.phone || '9840000000',
      street: cust.street || (addrParts[0] ? addrParts[0].trim() : 'Main Road'),
      area: cust.area || (addrParts.length > 1 ? addrParts.slice(1).join(',').trim() : (raw?.zone || 'Chennai Hub')),
      pincode: cust.pincode || (addrStr.match(/\d{6}/)?.[0] || '600042'),
      landmark: cust.landmark || ''
    },
    items: Array.isArray(raw?.items) ? raw.items.map((it: any) => ({
      id: it?.id || 'P1',
      name: it?.name || it?.n || 'Product Item',
      brand: it?.brand || it?.b || 'Unga Market',
      size: it?.size || it?.s || 'Standard Pack',
      qty: Number(it?.qty) || 1,
      price: Number(it?.price ?? it?.p) || 0,
      mrp: Number(it?.mrp ?? it?.m) || Number(it?.price ?? it?.p) || 0
    })) : [],
    subtotal: Number(raw?.subtotal) || 0,
    savings: Number(raw?.savings) || 0,
    deliveryFee: Number(raw?.deliveryFee ?? raw?.delivery) || 0,
    discount: Number(raw?.discount) || 0,
    couponCode: raw?.couponCode || '',
    total: Number(raw?.total) || 0,
    payMethod: ((raw?.payMethod || raw?.method || 'cod') as string).toLowerCase() as any,
    status: raw?.status || 'Pending',
    upiUtr: raw?.upiUtr || raw?.paymentId || '',
    assignedDriver: raw?.assignedDriver || raw?.driver,
    deliveryZone: raw?.deliveryZone || raw?.zone,
    etaMins: raw?.etaMins || 15
  };
}

export function App() {
  // App Navigation & Role State
  const [activeTab, setActiveTab] = useState<'customer' | 'shopowner' | 'delivery' | 'login'>('customer');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('unga_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Real-Time Geolocation & Dynamic ETA State (No predefined addresses)
  const [locationState, setLocationState] = useState<LocationState>(() => {
    const initialEta = computeDeliveryEta(2.1);
    return {
      status: 'detecting',
      coords: null,
      etaMins: initialEta.etaMins,
      etaDisplay: initialEta.etaDisplay,
      etaTimeStr: initialEta.etaTimeStr,
      distanceKm: initialEta.distanceKm,
      lastUpdated: Date.now()
    };
  });

  const handleRefreshLocation = () => {
    setLocationState((prev) => ({ ...prev, status: 'detecting' }));
    fetchRealtimeGeolocation().then((loc) => {
      setLocationState(loc);
      if (loc.status === 'located') {
        showToast(`📍 Live GPS synced: ${loc.etaMins} mins express delivery`);
      } else {
        showToast('📍 Live GPS active');
      }
    });
  };

  useEffect(() => {
    handleRefreshLocation();
  }, []);

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

  const handleLoginSuccess = (user: User, targetRole?: 'customer' | 'shopowner' | 'delivery') => {
    setCurrentUser(user);
    try {
      localStorage.setItem('unga_user', JSON.stringify(user));
    } catch (e) {}

    if (targetRole === 'shopowner' || user.role === 'shopowner') {
      setActiveTab('shopowner');
      showToast(`Welcome ${user.name} (Shop Owner)`);
    } else if (targetRole === 'delivery' || user.role === 'delivery') {
      setActiveTab('delivery');
      showToast(`Welcome ${user.name} (Delivery Partner)`);
    } else {
      setActiveTab('customer');
      showToast(`Welcome back, ${user.name}!`);
    }
  };

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
    instructions: 'Direct remittance to store owner'
  });

  // Modal Open States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isUpiPayOpen, setIsUpiPayOpen] = useState(false);
  const [isAiRecipeOpen, setIsAiRecipeOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

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
          setOrders(oData.orders.map(normalizeOrder));
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
    () => cart.reduce((s, i) => s + (i.product?.p || 0) * i.qty, 0),
    [cart]
  );
  const isFreeDelivery = cartTotal >= 199 || couponCode === 'FREEDEL';
  const deliveryFee = isFreeDelivery || cartTotal === 0 ? 0 : 25;
  const finalPayTotal = Math.max(0, cartTotal - couponDiscount + deliveryFee);

  // Cart Handlers
  const handleUpdateQty = (product: Product, delta: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx === -1) {
        if (delta > 0) {
          showToast(`Added 1x ${product.n} to cart ✓`);
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
    showToast(`Added ${items.length} ingredients to cart! ✓`);
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
    const c = (code || '').toUpperCase();
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
    showToast(`🎉 Payment confirmed for Order #${orderId}! Dispatch initiated in 10-15 mins.`);
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
      const cat = (p.c || '').toLowerCase();
      const selCat = (selectedCategory || 'all').toLowerCase();
      if (selCat !== 'all' && cat !== selCat) {
        return false;
      }
      if (selectedBrand !== 'all' && p.b !== selectedBrand) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (p.n || '').toLowerCase().includes(q) ||
          (p.b || '').toLowerCase().includes(q) ||
          (p.c || '').toLowerCase().includes(q) ||
          (p.id || '').toLowerCase().includes(q)
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
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setActiveTab('login')}
        onLogout={() => {
          setCurrentUser(null);
          try {
            localStorage.removeItem('unga_user');
          } catch (e) {}
          showToast('Signed out successfully');
        }}
        locationState={locationState}
        onRefreshLocation={handleRefreshLocation}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4">
        {/* Auth / Login Page View */}
        {activeTab === 'login' && (
          <AuthLoginPage
            onSuccessLogin={handleLoginSuccess}
            onClose={() => setActiveTab('customer')}
            currentUser={currentUser}
            orders={orders}
            onTrackOrder={(order) => {
              setTrackingOrder(order);
            }}
            onLogout={() => {
              setCurrentUser(null);
              try {
                localStorage.removeItem('unga_user');
              } catch (e) {}
              showToast('Signed out successfully');
            }}
          />
        )}

        {/* Customer Storefront View */}
        {activeTab === 'customer' && (
          <div className="space-y-4">
            {/* Blinkit-Style Festive & Express Hero Banner Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Primary Festive Banner (Inspired by Blinkit image 2) */}
              <div className="md:col-span-2 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-5 sm:p-6 text-white shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                <div className="space-y-1 relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <Zap size={11} className="fill-current" />
                    <span>⚡ {locationState.etaMins || 12} Mins Real-Time Express Delivery</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                    Supermarket Essentials at Everyday Best Prices
                  </h1>
                  <p className="text-xs text-emerald-100/90 max-w-lg font-medium">
                    Farm fresh produce, dairy, staples, snacks, beverages and household essentials delivered right to your live location in {locationState.etaMins || 12} minutes.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 relative z-10">
                  <button
                    type="button"
                    onClick={() => setIsAiRecipeOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Sparkles size={14} />
                    <span>AI Recipe-to-Cart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('produce');
                      setSelectedBrand('all');
                    }}
                    className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
                  >
                    🥦 Fresh Produce
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('dairy');
                      setSelectedBrand('all');
                    }}
                    className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
                  >
                    🥛 Daily Dairy
                  </button>
                </div>

                {/* Decorative background visual element */}
                <div className="absolute -right-6 -bottom-6 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* Quick Festive / Deals Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 border border-orange-200/80 rounded-3xl p-5 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-200/70 inline-block px-2 py-0.5 rounded-md">
                    Festive Specials &amp; Sweets
                  </div>
                  <h3 className="font-black text-slate-900 text-base mt-2">
                    Celebrate with Freshness &amp; Delights
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold mt-1">
                    Cadbury Silk, Traditional Ghee, Pure Honey, Dry Fruits &amp; Sweets.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-orange-800">
                    Use code <span className="underline decoration-orange-400">WELCOME20</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('snacks');
                      setSelectedBrand('all');
                    }}
                    className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    Explore Treats →
                  </button>
                </div>
              </div>
            </div>

            {/* Categories Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
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
                  Showing <b>{filteredProducts.length}</b> supermarket products
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
                <h3 className="font-extrabold text-slate-800 text-base">No items match your search</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try checking spelling or reset category filters to view our full supermarket catalog.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                  }}
                  className="bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl cursor-pointer"
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
        onOpenCategories={() => setSelectedCategory('all')}
        currentUser={currentUser}
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
        etaMins={locationState.etaMins}
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
        currentUser={currentUser}
        locationState={locationState}
        onRefreshLocation={handleRefreshLocation}
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

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
        order={trackingOrder}
      />
    </div>
  );
}
