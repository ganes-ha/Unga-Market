import React, { useState, useEffect } from 'react';
import { Order, PaymentSettings } from '../types';
import { Store, PackageCheck, Truck, CheckCircle, Clock, Settings, Search, RefreshCw, QrCode, Phone, MapPin, DollarSign } from 'lucide-react';
import QRCode from 'qrcode';

interface ShopOwnerPortalProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onRefreshOrders: () => void;
  paymentSettings: PaymentSettings;
  onSavePaymentSettings: (settings: PaymentSettings) => Promise<boolean>;
}

export const ShopOwnerPortal: React.FC<ShopOwnerPortalProps> = ({
  orders,
  onUpdateOrderStatus,
  onRefreshOrders,
  paymentSettings,
  onSavePaymentSettings
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<PaymentSettings>(paymentSettings);
  const [settingsQrPreview, setSettingsQrPreview] = useState<string>('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    setSettingsForm(paymentSettings);
  }, [paymentSettings]);

  useEffect(() => {
    if (!isSettingsOpen) return;
    const upiUri = `upi://pay?pa=${encodeURIComponent(settingsForm.upiVpa || 'jay.pratap.madhavan@okaxis')}&pn=${encodeURIComponent(settingsForm.payeeName || 'Jay Prathap')}&cu=INR`;
    QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 240,
      color: { dark: '#000000', light: '#FFFFFF' }
    }).then(setSettingsQrPreview).catch(() => {});
  }, [isSettingsOpen, settingsForm.upiVpa, settingsForm.payeeName]);

  const filteredOrders = orders.filter((o) => {
    const status = o.status || 'Pending';
    if (filterStatus !== 'all' && status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const id = o.id || '';
      const name = o.customer?.name || (typeof o.customer === 'string' ? o.customer : '');
      const phone = o.customer?.phone || (o as any).phone || '';
      const area = o.customer?.area || (o as any).addr || '';
      return (
        id.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        phone.includes(q) ||
        area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const packedCount = orders.filter((o) => o.status === 'Packed').length;
  const shippedCount = orders.filter((o) => o.status === 'Shipped').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveMsg('');
    const ok = await onSavePaymentSettings(settingsForm);
    setSavingSettings(false);
    if (ok) {
      setSaveMsg('Payment & Store settings updated successfully! ✓');
      setTimeout(() => {
        setSaveMsg('');
        setIsSettingsOpen(false);
      }, 1200);
    } else {
      setSaveMsg('Failed to update settings. Please check credentials.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Dashboard Top Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Store size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Store Operations Hub</h2>
              <p className="text-xs text-slate-500 font-semibold">
                Live Order Fulfillment &amp; 15-Min Dispatch · Chennai Hub
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshOrders}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Sync Live</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Settings size={14} />
            <span>Payment &amp; Store Settings</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Revenue</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalRevenue.toFixed(0)}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{orders.length} orders total</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <div className="text-xs font-bold text-amber-700 uppercase flex items-center justify-between">
            <span>Pending</span>
            <Clock size={14} />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1">{pendingCount}</div>
          <div className="text-[11px] font-semibold text-amber-600 mt-0.5">Needs Packing</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs">
          <div className="text-xs font-bold text-blue-700 uppercase flex items-center justify-between">
            <span>Packed</span>
            <PackageCheck size={14} />
          </div>
          <div className="text-2xl font-black text-blue-800 mt-1">{packedCount}</div>
          <div className="text-[11px] font-semibold text-blue-600 mt-0.5">Ready for Rider</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/40 shadow-xs">
          <div className="text-xs font-bold text-purple-700 uppercase flex items-center justify-between">
            <span>Out for Delivery</span>
            <Truck size={14} />
          </div>
          <div className="text-2xl font-black text-purple-800 mt-1">{shippedCount}</div>
          <div className="text-[11px] font-semibold text-purple-600 mt-0.5">Live on Road</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <div className="text-xs font-bold text-emerald-700 uppercase flex items-center justify-between">
            <span>Delivered</span>
            <CheckCircle size={14} />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{deliveredCount}</div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">Completed</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'Pending', 'Packed', 'Shipped', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus.toLowerCase() === st.toLowerCase()
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Name, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Orders Table / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <div className="text-3xl mb-2">📦</div>
            <h4 className="font-extrabold text-slate-800 text-sm">No orders matching filter</h4>
            <p className="text-xs text-slate-500">Orders placed by customers will stream in real-time.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-900">{order.id}</span>
                  <span className="text-xs text-slate-400 font-semibold">{order.date}</span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                      order.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === 'Packed'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'Shipped'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                    {(order.payMethod || (order as any).method || 'cod').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">
                    Total: <b className="text-emerald-700 text-sm">₹{Number(order.total || 0).toFixed(2)}</b>
                  </span>

                  {/* Status Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Packed')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        Pack Order ✓
                      </button>
                    )}
                    {order.status === 'Packed' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Shipped')}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        Handover to Rider 🚀
                      </button>
                    )}
                    {order.status === 'Shipped' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Delivered')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        Mark Delivered ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Info & Items */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Customer Details */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-extrabold text-slate-800 flex items-center gap-1">
                    <span>👤 {order.customer?.name || (typeof order.customer === 'string' ? order.customer : 'Valued Customer')}</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    <span>{order.customer?.phone || (order as any).phone || 'N/A'}</span>
                  </div>
                  <div className="text-slate-600 flex items-start gap-1">
                    <MapPin size={12} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="font-semibold text-emerald-950">
                      {order.geo
                        ? `Live GPS Pin (${order.geo.lat.toFixed(4)}°, ${order.geo.lng.toFixed(4)}°)`
                        : order.customer?.locationNote || 'Real-Time GPS Location'}
                    </span>
                  </div>
                  {order.customer?.locationNote && (
                    <div className="text-slate-500 text-[11px] pl-4">
                      Door: {order.customer.locationNote}
                    </div>
                  )}
                  <div className="text-emerald-700 font-extrabold text-[11px] pl-4">
                    ⚡ Delivery ETA: {order.etaMins || 12} mins {order.etaTimeStr ? `(~ ${order.etaTimeStr})` : ''}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 md:col-span-2">
                  <div className="font-extrabold text-slate-800 mb-1">
                    Items ({(order.items || []).reduce((s, i) => s + (Number(i.qty) || 1), 0)} units):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                    {(order.items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700 font-medium">
                        <span className="truncate pr-2">
                          {it.qty || 1}x {it.brand || ''} {it.name || (it as any).n || 'Item'} ({it.size || (it as any).s || 'Standard'})
                        </span>
                        <span className="font-bold text-slate-900">₹{(Number(it.price || (it as any).p) || 0) * (Number(it.qty) || 1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment & Store Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="bg-emerald-700 px-5 py-4 flex items-center justify-between text-white">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Settings size={18} />
                <span>Shop Owner UPI &amp; Gateway Settings</span>
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {saveMsg && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold p-3 rounded-xl">
                  {saveMsg}
                </div>
              )}

              {/* QR Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                <div className="text-xs font-bold text-slate-500 mb-2">Live QR Preview for Customers</div>
                {settingsQrPreview && (
                  <img
                    src={settingsQrPreview}
                    alt="UPI Preview"
                    className="w-36 h-36 mx-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xs"
                  />
                )}
                <div className="text-xs font-black text-slate-800 mt-2">
                  {settingsForm.payeeName} ({settingsForm.upiVpa})
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary UPI ID / VPA (NPCI Gateway)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.upiVpa}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upiVpa: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payee / Business Registered Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.payeeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, payeeName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GPay Number</label>
                  <input
                    type="text"
                    value={settingsForm.gpayPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gpayPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PhonePe Number</label>
                  <input
                    type="text"
                    value={settingsForm.phonepeNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phonepeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Admin PIN</label>
                  <input
                    type="password"
                    value={settingsForm.storePin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storePin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store Email</label>
                  <input
                    type="email"
                    value={settingsForm.storeEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition-all text-xs cursor-pointer"
              >
                {savingSettings ? 'Saving Settings...' : 'Save & Apply Gateway Settings ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
