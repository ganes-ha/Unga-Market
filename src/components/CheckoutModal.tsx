import React, { useState } from 'react';
import { X, MapPin, Navigation, Smartphone, User, Home, ShieldCheck, Check } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  finalTotal: number;
  couponCode?: string;
  onOrderSuccess: (orderData: any, payMethod: 'gpay' | 'upi' | 'cod') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  subtotal,
  discount,
  deliveryFee,
  finalTotal,
  couponCode,
  onOrderSuccess
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('Velachery, Chennai');
  const [pincode, setPincode] = useState('600042');
  const [landmark, setLandmark] = useState('');
  const [payType, setPayType] = useState<'gpay' | 'upi' | 'cod'>('gpay');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by this browser.');
      return;
    }
    setIsLocating(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.suburb || addr.neighbourhood || 'Main Road';
            const suburb = addr.suburb || addr.city_district || addr.city || 'Chennai';
            const post = addr.postcode || '600042';
            setStreet(road);
            setArea(`${suburb}, Chennai`);
            setPincode(post);
          } else {
            setArea(`GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}), Chennai`);
          }
        } catch (e) {
          setArea(`GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg('Location permission denied. Please enter address manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Please enter customer name');
    if (!phone.trim() || phone.trim().length < 10) return setErrorMsg('Please enter valid 10-digit mobile number');
    if (!street.trim()) return setErrorMsg('Please enter door number and street address');
    if (!pincode.trim() || pincode.trim().length < 6) return setErrorMsg('Please enter 6-digit Chennai pincode');

    setIsSubmitting(true);
    setErrorMsg('');

    const orderPayload = {
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        street: street.trim(),
        area: area.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim()
      },
      items: cart.map(i => ({
        id: i.product.id,
        name: i.product.n,
        brand: i.product.b,
        size: i.product.s,
        qty: i.qty,
        price: i.product.p,
        mrp: i.product.m
      })),
      subtotal,
      savings: cart.reduce((s, i) => s + (i.product.m - i.product.p) * i.qty, 0),
      discount,
      deliveryFee,
      total: finalTotal,
      payMethod: payType,
      couponCode: couponCode || ''
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.order) {
        onOrderSuccess(data.order, payType);
      } else {
        setErrorMsg(data.error || 'Failed to place order. Please retry.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Network error placing order. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Delivery & Payment</h3>
            <p className="text-xs text-slate-500 font-medium">10–15 Mins Express Wholesale Delivery</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              1. Customer Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Smartphone size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9840123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
                2. Delivery Address in Chennai
              </h4>
              <button
                type="button"
                onClick={handleUseGPS}
                disabled={isLocating}
                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                <Navigation size={12} className={isLocating ? 'animate-spin' : ''} />
                <span>{isLocating ? 'Detecting GPS...' : 'Auto-fill GPS'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Door / Flat No. & Street</label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 3B, Sunshine Apts, 12th Cross St"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Velachery, Chennai"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 600042"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              3. Payment Method
            </h4>

            <div className="space-y-2">
              {/* Google Pay Option */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  payType === 'gpay'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payType"
                  value="gpay"
                  checked={payType === 'gpay'}
                  onChange={() => setPayType('gpay')}
                  className="accent-emerald-600 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>🟢 Google Pay / GPay Direct</span>
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                      RECOMMENDED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Direct QR scan &amp; transfer to Jay Prathap (jay.pratap.madhavan@okaxis)
                  </div>
                </div>
              </label>

              {/* Universal UPI QR */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  payType === 'upi'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payType"
                  value="upi"
                  checked={payType === 'upi'}
                  onChange={() => setPayType('upi')}
                  className="accent-emerald-600 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-extrabold text-xs text-slate-900">
                    ⚡ PhonePe / Paytm / BHIM UPI QR
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Universal NPCI QR code scan with 0% extra gateway fees
                  </div>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  payType === 'cod'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="payType"
                  value="cod"
                  checked={payType === 'cod'}
                  onChange={() => setPayType('cod')}
                  className="accent-emerald-600 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-extrabold text-xs text-slate-900">
                    💵 Cash on Delivery (COD)
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Pay invoice cash to wholesale delivery agent upon physical handover
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-bold">Total Wholesale Net Amount:</span>
              <div className="text-[11px] text-slate-400">{cart.reduce((s, i) => s + i.qty, 0)} items</div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-700">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-md transition-all text-sm cursor-pointer"
          >
            {isSubmitting
              ? 'Processing Order...'
              : payType === 'cod'
              ? 'Place Cash on Delivery Order ✓'
              : 'Proceed to Pay Shop Owner ⚡'}
          </button>
        </form>
      </div>
    </div>
  );
};
