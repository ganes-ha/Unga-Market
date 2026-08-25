import React from 'react';
import { X, CheckCircle, Clock, PackageCheck, Truck, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Order } from '../types';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  if (!isOpen || !order) return null;

  const steps = [
    { status: 'Pending', label: 'Order Received', desc: 'Shop owner confirmed order', icon: Clock },
    { status: 'Packed', label: 'Packed & Invoiced', desc: 'Items packed at Velachery Hub', icon: PackageCheck },
    { status: 'Shipped', label: 'Out for Delivery', desc: 'Assigned to Express Rider RD-409', icon: Truck },
    { status: 'Delivered', label: 'Delivered', desc: 'Handover complete', icon: CheckCircle }
  ];

  const orderStatus = order.status || 'Pending';
  const currentIdx = steps.findIndex((s) => s.status.toLowerCase() === orderStatus.toLowerCase());
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-emerald-700 px-5 py-4 flex items-center justify-between text-white">
          <div>
            <h3 className="font-black text-base text-white">Order Tracking #{order.id}</h3>
            <p className="text-xs text-emerald-100 font-medium">{order.date}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-emerald-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Progress Timeline */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isDone = idx <= activeIdx;
              const isCurrent = idx === activeIdx;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex items-start gap-3 relative">
                  {/* Vertical Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-8 -ml-[1px] ${
                        idx < activeIdx ? 'bg-emerald-600' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 z-10 ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="pt-0.5">
                    <div className="font-extrabold text-xs text-slate-800 flex items-center gap-2">
                      <span>{step.label}</span>
                      {isCurrent && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.2 rounded">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery & Payment Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Delivery Destination:</span>
              <span className="font-extrabold text-emerald-800 text-right flex items-center gap-1">
                <MapPin size={12} className="text-emerald-600 shrink-0" />
                <span>
                  {order.geo
                    ? `Live GPS Pin (${order.geo.lat.toFixed(4)}°, ${order.geo.lng.toFixed(4)}°)`
                    : order.customer?.locationNote || 'Real-Time GPS Location'}
                </span>
              </span>
            </div>
            {order.customer?.locationNote && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Door / Flat:</span>
                <span className="font-extrabold text-slate-800 text-right">
                  {order.customer.locationNote}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Estimated Delivery:</span>
              <span className="font-extrabold text-emerald-700">
                ⚡ {order.etaMins || 12} Mins ETA {order.etaTimeStr ? `(~ ${order.etaTimeStr})` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Customer Phone:</span>
              <span className="font-extrabold text-slate-800">
                {order.customer?.phone || (order as any).phone || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">Payment Mode:</span>
              <span className="font-extrabold text-emerald-700 uppercase">
                {(order.payMethod || (order as any).method || 'cod').toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
              <span className="font-black text-slate-900">Total Invoice Amount:</span>
              <span className="font-black text-emerald-700">₹{Number(order.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl shadow-xs transition-all text-xs cursor-pointer"
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  );
};
