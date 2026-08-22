import React from 'react';
import { ShoppingBag, Search, Mic, Sparkles, MapPin, Store, Truck } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAiRecipe: () => void;
  onOpenVoice: () => void;
  activeTab: 'customer' | 'shopowner' | 'delivery';
  onChangeTab: (tab: 'customer' | 'shopowner' | 'delivery') => void;
  currentUser: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  selectedHub: string;
  onChangeHub: (hub: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAiRecipe,
  onOpenVoice,
  activeTab,
  onChangeTab,
  currentUser,
  onOpenAuth,
  onLogout,
  selectedHub,
  onChangeHub
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner: Free Delivery + Hub Status */}
      <div className="bg-emerald-800 text-white text-[11px] font-bold px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded text-[10px]">DIRECT</span>
          <span>⚡ Flat 20% Off Direct Pricing · Free 10-15 Min Delivery in Chennai on ₹499+</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Hub Dropdown */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => onChangeTab('customer')}
          >
            <svg viewBox="0 0 44 44" className="w-10 h-10 flex-shrink-0">
              <defs>
                <linearGradient id="hdrLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#149A46" />
                  <stop offset="100%" stopColor="#0A6B2E" />
                </linearGradient>
              </defs>
              <rect width="44" height="44" rx="12" fill="url(#hdrLogoGrad)" />
              <circle cx="33" cy="10" r="5" fill="#FF5722" />
              <path d="M 28 20 C 32 8, 40 6, 42 10 C 38 24, 32 27, 28 20 Z" fill="#4CAF50" />
              <path d="M 28 20 Q 35 15 42 10" stroke="#81C784" strokeWidth="1.5" fill="none" />
              <text x="22" y="35" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="22" fill="white">U</text>
            </svg>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black tracking-tight leading-none" style={{ background: 'linear-gradient(to right, #139543, #085F27)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Unga</span>
                <span className="text-xl font-black tracking-tight leading-none" style={{ background: 'linear-gradient(to right, #FF3E14, #D92200)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Market</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase block">
                Your Everyday, Our Priority!
              </span>
            </div>
          </div>

          {/* Delivery Hub Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-700">
            <MapPin size={14} className="text-emerald-600" />
            <select
              value={selectedHub}
              onChange={(e) => onChangeHub(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-[12px]"
            >
              <option value="Velachery">Velachery Hub (10-12m)</option>
              <option value="OMR">OMR Thoraipakkam (15m)</option>
              <option value="Adyar">Adyar Besant Nagar (15m)</option>
              <option value="Guindy">Guindy Ekkattuthangal (12m)</option>
              <option value="Tambaram">Tambaram GST Road (20m)</option>
            </select>
          </div>
        </div>

        {/* Universal Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 1,600+ items (Tata Tea, Maggi, Fortune, Surf Excel)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-20 py-2 bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-[13px] font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenVoice}
                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Voice Search (English / Tamil)"
              >
                <Mic size={16} />
              </button>
              <button
                type="button"
                onClick={onOpenAiRecipe}
                className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-lg shadow-2xs hover:brightness-110 active:scale-95 transition-all"
                title="AI Recipe to Cart Assistant"
              >
                <Sparkles size={13} />
                <span className="hidden sm:inline">AI Recipe</span>
              </button>
            </div>
          </div>
        </div>

        {/* Portal Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Portal Switcher Tabs */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[12px] font-bold">
            <button
              onClick={() => onChangeTab('customer')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeTab === 'customer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Storefront
            </button>
            <button
              onClick={() => onChangeTab('shopowner')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'shopowner'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store size={13} />
              <span>Shop Owner</span>
            </button>
            <button
              onClick={() => onChangeTab('delivery')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'delivery'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck size={13} />
              <span>Delivery Boy</span>
            </button>
          </div>

          {/* Cart Trigger Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer font-black text-[13px]"
          >
            <div className="relative">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-[10px] font-semibold text-emerald-100">Cart</span>
              <span className="text-[13px]">₹{cartTotal.toFixed(0)}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
