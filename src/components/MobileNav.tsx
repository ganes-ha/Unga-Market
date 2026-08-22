import React from 'react';
import { Home, Grid, ShoppingBag, Truck, Store } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'customer' | 'shopowner' | 'delivery';
  onChangeTab: (tab: 'customer' | 'shopowner' | 'delivery') => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenCategories: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onChangeTab,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenCategories
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom shadow-lg">
      <div className="grid grid-cols-5 h-14">
        {/* Storefront Home */}
        <button
          onClick={() => onChangeTab('customer')}
          className={`flex flex-col items-center justify-center gap-1 ${
            activeTab === 'customer' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
          }`}
        >
          <Home size={19} strokeWidth={activeTab === 'customer' ? 2.5 : 2} />
          <span className="text-[10px]">Shop</span>
        </button>

        {/* Categories Jump */}
        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center gap-1 text-slate-500 font-medium hover:text-emerald-700"
        >
          <Grid size={19} strokeWidth={2} />
          <span className="text-[10px]">Categories</span>
        </button>

        {/* Cart Drawer Button */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center gap-1 text-emerald-700 font-bold relative"
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

        {/* Shop Owner Portal */}
        <button
          onClick={() => onChangeTab(activeTab === 'shopowner' ? 'customer' : 'shopowner')}
          className={`flex flex-col items-center justify-center gap-1 ${
            activeTab === 'shopowner' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
          }`}
        >
          <Store size={19} strokeWidth={activeTab === 'shopowner' ? 2.5 : 2} />
          <span className="text-[10px]">Shop Owner</span>
        </button>

        {/* Rider / Delivery Portal */}
        <button
          onClick={() => onChangeTab(activeTab === 'delivery' ? 'customer' : 'delivery')}
          className={`flex flex-col items-center justify-center gap-1 ${
            activeTab === 'delivery' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 font-medium'
          }`}
        >
          <Truck size={19} strokeWidth={activeTab === 'delivery' ? 2.5 : 2} />
          <span className="text-[10px]">Rider App</span>
        </button>
      </div>
    </nav>
  );
};
