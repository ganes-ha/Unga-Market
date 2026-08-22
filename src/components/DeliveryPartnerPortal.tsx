import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../types';
import { Truck, Navigation, Phone, MapPin, CheckCircle, Package, AlertCircle } from 'lucide-react';

interface DeliveryPartnerPortalProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onRefreshOrders: () => void;
}

export const DeliveryPartnerPortal: React.FC<DeliveryPartnerPortalProps> = ({
  orders,
  onUpdateOrderStatus,
  onRefreshOrders
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const activeDeliveries = orders.filter(
    (o) => o.status === 'Packed' || o.status === 'Shipped'
  );

  useEffect(() => {
    if (activeDeliveries.length > 0 && !selectedOrder) {
      setSelectedOrder(activeDeliveries[0]);
    }
  }, [activeDeliveries, selectedOrder]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([12.9815, 80.2180], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Hub Marker (Velachery Main Hub)
      const hubIcon = L.divIcon({
        className: 'custom-hub-marker',
        html: '<div style="background:#0F8A3E;color:#fff;font-weight:900;font-size:11px;padding:4px 8px;border-radius:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap">🏪 Wholesale Hub</div>',
        iconSize: [110, 30]
      });
      L.marker([12.9815, 80.2180], { icon: hubIcon }).addTo(map);

      mapInstanceRef.current = map;
    }

    if (mapInstanceRef.current && selectedOrder) {
      const map = mapInstanceRef.current;
      // Add simulated customer drop-off marker
      const destLat = 12.9750 + (Math.random() - 0.5) * 0.02;
      const destLng = 80.2200 + (Math.random() - 0.5) * 0.02;

      const custIcon = L.divIcon({
        className: 'custom-cust-marker',
        html: `<div style="background:#F26522;color:#fff;font-weight:900;font-size:11px;padding:4px 8px;border-radius:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap">📍 ${selectedOrder.customer.name}</div>`,
        iconSize: [120, 30]
      });

      const custMarker = L.marker([destLat, destLng], { icon: custIcon }).addTo(map);
      
      // Draw simulated route line
      const polyline = L.polyline([
        [12.9815, 80.2180],
        [(12.9815 + destLat) / 2, (80.2180 + destLng) / 2 + 0.003],
        [destLat, destLng]
      ], { color: '#0F8A3E', weight: 4, dashArray: '6, 8' }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [selectedOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Rider Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <Truck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Rider Express Dispatch</h2>
            <p className="text-xs text-slate-500 font-semibold">
              Rider ID: RD-409 · Velachery / OMR Zone · 10-15m Express
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-extrabold text-slate-700">
              {isOnline ? 'Active Online' : 'Offline'}
            </span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className="text-[11px] font-bold text-emerald-700 ml-1 underline cursor-pointer"
            >
              Toggle
            </button>
          </div>

          <button
            onClick={onRefreshOrders}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Refresh Deliveries
          </button>
        </div>
      </div>

      {/* Main Grid: Active Orders on Left, GPS Map on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deliveries List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
            Active Assigned Deliveries ({activeDeliveries.length})
          </h3>

          {activeDeliveries.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h4 className="font-extrabold text-slate-800 text-sm">All deliveries completed!</h4>
              <p className="text-xs text-slate-500 mt-1">
                New wholesale orders from customers will appear here automatically.
              </p>
            </div>
          ) : (
            activeDeliveries.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                  selectedOrder?.id === order.id
                    ? 'border-purple-500 shadow-md ring-2 ring-purple-100'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-black text-sm text-slate-900">{order.id}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      order.status === 'Packed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {order.status === 'Packed' ? 'Ready to Pick' : 'In Transit'}
                  </span>
                </div>

                <div className="py-2 space-y-1 text-xs">
                  <div className="font-extrabold text-slate-800">👤 {order.customer.name}</div>
                  <div className="text-slate-600 flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    <span>{order.customer.phone}</span>
                  </div>
                  <div className="text-slate-600 flex items-start gap-1">
                    <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="truncate">
                      {order.customer.street}, {order.customer.area}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">
                    Collect: <b className="text-emerald-700">₹{order.total}</b> (
                    {order.payMethod.toUpperCase()})
                  </span>

                  {order.status === 'Packed' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateOrderStatus(order.id, 'Shipped');
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-xs"
                    >
                      Start Delivery 🚀
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateOrderStatus(order.id, 'Delivered');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-xs"
                    >
                      Mark Delivered ✓
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live GPS Routing Map */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Live GPS Navigation &amp; Zone Routing
            </h3>
            {selectedOrder && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                ETA: 10–12 Mins
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs h-[420px] relative">
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
