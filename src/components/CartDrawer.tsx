import React, { useState } from 'react';
import { CartItem, Product } from '../types';
import { X, Trash2, Plus, Minus, Tag, Check, Sparkles, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { createProductSVG } from '../utils/packshot';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQty: (product: Product, delta: number) => void;
  onClearCart: () => void;
  onProceedCheckout: () => void;
  couponCode: string;
  couponDiscount: number;
  onApplyCoupon: (code: string) => Promise<boolean>;
  onRemoveCoupon: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onClearCart,
  onProceedCheckout,
  couponCode,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  if (!isOpen) return null;

  const totalMrp = cart.reduce((sum, item) => sum + item.product.m * item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.p * item.qty, 0);
  const itemSavings = totalMrp - subtotal;
  const isFreeDelivery = subtotal >= 199 || couponCode === 'FREEDEL';
  const deliveryFee = isFreeDelivery || subtotal === 0 ? 0 : 25;
  const finalTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);
  const totalCombinedSavings = itemSavings + couponDiscount + (deliveryFee === 0 && subtotal > 0 ? 25 : 0);

  const handleApply = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput || '').trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponMsg(null);
    const ok = await onApplyCoupon(code);
    setCouponLoading(false);
    if (ok) {
      setCouponMsg({ text: `Coupon ${code} applied successfully!`, type: 'ok' });
      setCouponInput('');
    } else {
      setCouponMsg({ text: 'Invalid coupon code. Try WELCOME20, UNGA10, FREEDEL', type: 'err' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <span>My Cart</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2 py-0.5 rounded-full">
                  {cart.reduce((s, i) => s + i.qty, 0)} items
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ⚡ Delivered in 10-15 Mins · Unga Market
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Delivery Meter */}
          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1.5">
              <span className="flex items-center gap-1">
                <Truck size={14} className="text-emerald-600" />
                {subtotal >= 199 ? '🎉 Free Delivery Unlocked!' : `Add ₹${(199 - subtotal).toFixed(0)} more for Free Delivery`}
              </span>
              <span>₹199 Free Delivery</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotal / 199) * 100)}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-3">
                  🛍️
                </div>
                <h4 className="font-extrabold text-slate-800 text-base mb-1">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  Add fresh produce, dairy, grocery, and snacks to your cart for 15-minute delivery.
                </p>
                <button
                  onClick={onClose}
                  className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="pt-3 flex gap-3 items-center">
                  <img
                    src={item.product.img || createProductSVG(item.product)}
                    alt={item.product.n}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = createProductSVG(item.product);
                    }}
                    className="w-14 h-14 object-contain rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      {item.product.b}
                    </div>
                    <h5 className="font-bold text-xs text-slate-800 truncate" title={item.product.n}>
                      {item.product.n}
                    </h5>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Net: {item.product.s}
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-emerald-700">₹{item.product.p}</span>
                      <span className="text-[10px] font-semibold text-slate-400 line-through">
                        ₹{item.product.m}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 h-8">
                    <button
                      onClick={() => onUpdateQty(item.product, -1)}
                      className="w-7 h-full flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-slate-200 rounded-l-lg font-black"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-xs font-extrabold text-slate-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.product, 1)}
                      className="w-7 h-full flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:bg-slate-200 rounded-r-lg font-black"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Coupon Engine */}
              <div>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-100 border border-emerald-300 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <Sparkles size={14} className="text-emerald-600" />
                      <span>{couponCode} Applied (-₹{couponDiscount})</span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-emerald-700 hover:text-red-600 font-extrabold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Promo code (WELCOME20, UNGA10)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        onClick={() => handleApply()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                      >
                        Apply
                      </button>
                    </div>
                    {/* Quick Coupon Pills */}
                    <div className="flex gap-1.5 overflow-x-auto py-1">
                      {['WELCOME20', 'UNGA10', 'FREEDEL'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleApply(c)}
                          className="bg-white border border-dashed border-emerald-600 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md hover:bg-emerald-50 whitespace-nowrap cursor-pointer"
                        >
                          +{c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {couponMsg && (
                  <p
                    className={`text-[11px] font-bold mt-1 ${
                      couponMsg.type === 'ok' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs border-t border-slate-200 pt-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Total MRP Value:</span>
                  <span className="line-through text-slate-400">₹{totalMrp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-700">
                  <span>Product Discount:</span>
                  <span>-₹{itemSavings.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between font-semibold text-emerald-700">
                    <span>Coupon Discount ({couponCode}):</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Partner Fee (15 Mins):</span>
                  <span>{deliveryFee === 0 ? <b className="text-emerald-700">FREE</b> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 font-extrabold text-sm text-slate-900">
                  <span>To Pay:</span>
                  <span className="text-lg text-emerald-700">₹{finalTotal.toFixed(2)}</span>
                </div>
                <div className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold p-2 rounded-xl text-center">
                  🎉 Total Combined Savings on this Order: ₹{totalCombinedSavings.toFixed(2)}
                </div>
              </div>

              {/* Proceed Button */}
              <button
                type="button"
                onClick={onProceedCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
