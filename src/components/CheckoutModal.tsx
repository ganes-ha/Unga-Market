import React, { useState, useEffect } from 'react';
import { X, Navigation, Smartphone, User, ShieldCheck, CheckCircle2, RotateCw, Clock, MapPin } from 'lucide-react';
import { CartItem, User as UserType } from '../types';
import { LocationState } from '../utils/locationEta';

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
  currentUser?: UserType | null;
  locationState: LocationState;
  onRefreshLocation: () => void;
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
  onOrderSuccess,
  currentUser,
  locationState,
  onRefreshLocation
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [doorNote, setDoorNote] = useState('');
  const [landmark, setLandmark] = useState('');
  const [payType, setPayType] = useState<'gpay' | 'upi' | 'cod'>('gpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !name) setName(currentUser.name);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErrorMsg('Please enter customer name');
    if (!phone.trim() || phone.trim().length < 10) return setErrorMsg('Please enter valid 10-digit mobile number');

    setIsSubmitting(true);
    setErrorMsg('');

    const orderPayload = {
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        locationNote: doorNote.trim() || undefined,
        landmark: landmark.trim() || undefined
      },
      geo: locationState.coords
        ? {
            lat: locationState.coords.latitude,
            lng: locationState.coords.longitude,
            accuracy: locationState.coords.accuracy,
            distanceKm: locationState.distanceKm
          }
        : {
            lat: 12.9815,
            lng: 80.2180,
            distanceKm: locationState.distanceKm
          },
      etaMins: locationState.etaMins || 12,
      etaTimeStr: locationState.etaTimeStr,
      items: cart.map((i) => ({
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
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-lg">Express Checkout</h3>
              <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                ⚡ {locationState.etaMins || 12} Mins ETA
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium">Real-Time GPS Express Delivery</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
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

          {/* 1. Real-Time Geolocation Pin Card */}
          <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Navigation
                    size={16}
                    className={locationState.status === 'detecting' ? 'animate-spin' : ''}
                  />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                    {locationState.status === 'located'
                      ? 'Real-Time GPS Location Active'
                      : locationState.status === 'detecting'
                      ? 'Detecting Real-Time Coordinates...'
                      : 'Live Geolocation Pin'}
                  </h4>
                  <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                    <Clock size={12} className="text-emerald-600" />
                    <span>
                      Estimated Delivery: <b>{locationState.etaMins || 12} mins</b> (Arriving ~{' '}
                      {locationState.etaTimeStr})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onRefreshLocation}
                className="flex items-center gap-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
              >
                <RotateCw
                  size={11}
                  className={locationState.status === 'detecting' ? 'animate-spin' : ''}
                />
                <span>Refresh GPS</span>
              </button>
            </div>

            {/* GPS Accuracy & Coordinates Summary without displaying address string */}
            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
              <div className="flex items-center gap-1 text-emerald-900 font-extrabold">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>
                  {locationState.coords
                    ? `GPS Pin: ${locationState.coords.latitude.toFixed(4)}°N, ${locationState.coords.longitude.toFixed(4)}°E`
                    : 'Real-Time Dispatch Grid Active'}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-950 font-black px-2 py-0.5 rounded-md">
                {locationState.distanceKm ? `${locationState.distanceKm} km from Dispatch Hub` : 'Express Zone'}
              </span>
            </div>
          </div>

          {/* 2. Customer Contact Details */}
          <div className="space-y-3 pt-1">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              1. Customer Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohith Jaya Prasad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (For Rider Updates)</label>
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

          {/* 3. Door Handover Instructions (Optional notes for rider) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              2. Door Handover Note (Optional)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Flat / House / Floor No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 4B, 3rd Floor"
                  value={doorNote}
                  onChange={(e) => setDoorNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Instruction / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring bell / Leave at security"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Payment Method Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              3. Payment Method
            </h4>

            <div className="space-y-2">
              {/* Google Pay Option */}
              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
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
                    <span>🟢 Google Pay Direct</span>
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
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
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
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
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
                    Pay cash to delivery partner upon order handover at your doorstep
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-bold">Total Payable Amount:</span>
              <div className="text-[11px] text-slate-400">
                {cart.reduce((s, i) => s + i.qty, 0)} items · ⚡ {locationState.etaMins || 12} Mins ETA
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-700">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl shadow-md transition-all text-sm cursor-pointer"
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
