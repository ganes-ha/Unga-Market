import React from 'react';
import { Home, Grid, ShoppingBag, Truck, Store, User } from 'lucide-react';
import { User as UserType } from '../types';

interface MobileNavProps {
  activeTab: 'customer' | 'shopowner' | 'delivery' | 'login';
  onChangeTab: (tab: 'customer' | 'shopowner' | 'delivery' | 'login') => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenCategories: () => void;
  currentUser: UserType | null;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onChangeTab,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenCategories,
  currentUser
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom shadow-lg">
      <div className="grid grid-cols-5 h-14">
        {/* Storefront Home */}
        <button
          onClick={() => onChangeTab('customer')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'customer' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
          }`}
        >
          <Home size={19} strokeWidth={activeTab === 'customer' ? 2.5 : 2} />
          <span className="text-[10px]">Shop</span>
        </button>

        {/* Categories Jump */}
        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center gap-1 text-slate-500 font-medium hover:text-emerald-700 cursor-pointer"
        >
          <Grid size={19} strokeWidth={2} />
          <span className="text-[10px]">Categories</span>
        </button>

        {/* Cart Drawer Button */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center gap-1 text-emerald-700 font-bold relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag size={20} strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart (₹{cartTotal.toFixed(0)})</span>
        </button>

        {/* Portals or Login Button */}
        <button
          onClick={() => onChangeTab(activeTab === 'shopowner' ? 'customer' : 'shopowner')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'shopowner' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
          }`}
        >
          <Store size={19} strokeWidth={activeTab === 'shopowner' ? 2.5 : 2} />
          <span className="text-[10px]">Merchant</span>
        </button>

        {/* User Login / Profile */}
        <button
          onClick={() => onChangeTab(activeTab === 'login' ? 'customer' : 'login')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'login' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
          }`}
        >
          <User size={19} strokeWidth={activeTab === 'login' ? 2.5 : 2} />
          <span className="text-[10px]">{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
        </button>
      </div>
    </nav>
  );
};

