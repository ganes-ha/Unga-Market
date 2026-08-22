import React from 'react';
import { ShoppingBag, Search, Mic, Sparkles, QrCode, MapPin, Store, Truck, User } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAiRecipe: () => void;
  onOpenVoice: () => void;
  onOpenMobileShare: () => void;
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
  onOpenMobileShare,
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
          <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded text-[10px]">DIRECT FMCG</span>
          <span>⚡ Flat 20% Off Wholesale Pricing · Free 10-15 Min Delivery in Chennai on ₹499+</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenMobileShare}
            className="flex items-center gap-1 hover:text-emerald-200 transition-colors cursor-pointer"
          >
            <QrCode size={13} />
            <span>Open on Mobile / Share</span>
          </button>
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
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-xs">
              U
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">UNGA</span>
                <span className="text-xl font-black tracking-tight text-orange-500 leading-none">MARKET</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase block">
                Wholesale Direct Hub
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
              placeholder="Search 1,600+ wholesale items (Tata Tea, Maggi, Fortune, Surf Excel)..."
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
              <span className="text-[10px] font-semibold text-emerald-100">Wholesale Cart</span>
              <span className="text-[13px]">₹{cartTotal.toFixed(0)}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
