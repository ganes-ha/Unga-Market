import React from 'react';
import { ShoppingBag, Search, Mic, Sparkles, MapPin, Store, Truck, User, ChevronDown } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAiRecipe: () => void;
  onOpenVoice: () => void;
  activeTab: 'customer' | 'shopowner' | 'delivery' | 'login';
  onChangeTab: (tab: 'customer' | 'shopowner' | 'delivery' | 'login') => void;
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
      {/* Top Banner: Superfast Delivery & Best Price Promise */}
      <div className="bg-emerald-800 text-white text-[11px] font-bold px-3 sm:px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap mx-auto sm:mx-0">
          <span className="bg-emerald-500 text-slate-900 font-extrabold px-1.5 py-0.2 rounded text-[10px] uppercase">
            ⚡ 15 MINS
          </span>
          <span>Supermarket Essentials Delivered in 10–15 Minutes · Free Delivery on ₹199+</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-emerald-200 text-[10px]">
          <span>Your Everyday, Our Priority!</span>
        </div>
      </div>

      {/* Main Blinkit-Style Navigation Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
          {/* Logo & Delivery Time Header */}
          <div className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0" onClick={() => onChangeTab('customer')}>
            <img
              src="./logo.svg"
              alt="Unga Market"
              className="h-9 sm:h-11 w-auto max-w-[120px] sm:max-w-[150px] object-contain shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1 whitespace-nowrap">
                <span className="text-[11px] sm:text-[12px] text-slate-500 font-bold leading-none">Unga Market in</span>
                <span className="text-[14px] sm:text-[16px] font-black text-emerald-700 leading-none">15 mins</span>
              </div>
              
              {/* Location Selector */}
              <div className="flex items-center gap-1 text-[11px] sm:text-[12px] font-extrabold text-slate-800 mt-1 hover:text-emerald-700 transition-colors max-w-[140px] sm:max-w-[200px]">
                <span className="text-emerald-600 font-black shrink-0">HOME -</span>
                <div className="relative inline-flex items-center min-w-0 flex-1">
                  <select
                    value={selectedHub}
                    onChange={(e) => onChangeHub(e.target.value)}
                    className="bg-transparent font-extrabold text-slate-800 outline-none cursor-pointer pr-3.5 appearance-none text-[11px] sm:text-[12px] truncate w-full"
                  >
                    <option value="Velachery">Block A, Velachery (10m)</option>
                    <option value="OMR">OMR Thoraipakkam (15m)</option>
                    <option value="Adyar">Adyar Besant Nagar (12m)</option>
                    <option value="Guindy">Guindy Industrial (10m)</option>
                    <option value="Tambaram">Tambaram West (15m)</option>
                  </select>
                  <ChevronDown size={11} className="text-slate-500 pointer-events-none absolute right-0 shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Right Controls: User & Cart */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={() => onChangeTab('login')}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-300"
                title="Profile & Orders"
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-2.5 py-1.5 rounded-xl cursor-pointer"
              >
                <User size={13} />
                <span>Login</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCart}
              className="flex items-center gap-1.5 bg-emerald-600 active:scale-95 text-white px-2.5 py-1.5 rounded-xl font-black text-xs shadow-xs"
            >
              <div className="relative">
                <ShoppingBag size={15} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="whitespace-nowrap">₹{cartTotal.toFixed(0)}</span>
            </button>
          </div>
        </div>

        {/* Wide Search Bar with Mic & AI Recipe */}
        <div className="flex-1 max-w-2xl relative w-full">
          <div className="relative flex items-center">
            <Search size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder='Search "milk, veggies, tea, oil, snacks..."'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9.5 pr-28 sm:pr-32 py-2 bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-[13px] font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenVoice}
                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Voice Search"
              >
                <Mic size={16} />
              </button>
              <button
                type="button"
                onClick={onOpenAiRecipe}
                className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[11px] px-2 sm:px-2.5 py-1 rounded-lg shadow-2xs hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
                title="AI Recipe to Cart Assistant"
              >
                <Sparkles size={13} />
                <span>AI Recipe</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Portal Switcher, Account & Cart */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Portal Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-extrabold">
            <button
              onClick={() => onChangeTab('customer')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Store
            </button>
            <button
              onClick={() => onChangeTab('shopowner')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'shopowner'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store size={12} />
              <span>Merchant</span>
            </button>
            <button
              onClick={() => onChangeTab('delivery')}
              className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'delivery'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck size={12} />
              <span>Rider</span>
            </button>
          </div>

          {/* User Sign In / Profile */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-slate-100 pl-2.5 pr-1.5 py-1 rounded-xl border border-slate-200 text-xs font-bold">
              <div className="flex flex-col text-left leading-none">
                <span className="text-[11px] font-extrabold text-slate-800 max-w-[85px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-extrabold text-emerald-700 uppercase">
                  {currentUser.role}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Sign Out"
                className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-slate-200/60 transition-colors text-[10px] font-bold cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <User size={14} className="text-emerald-700" />
              <span>Sign In</span>
            </button>
          )}

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
            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] font-semibold text-emerald-100">My Cart</span>
              <span className="text-[13px]">₹{cartTotal.toFixed(0)}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
