export interface Product {
  id: string;
  c: string;       // category key (tea, coffee, noodles, etc.)
  b: string;       // brand name
  n: string;       // product name
  s: string;       // pack size / unit
  m: number;       // MRP in INR
  disc: number;    // Discount amount
  p: number;       // Price in INR
  img: string;     // Product image URL or fallback SVG
  bulkMin?: number;
  bulkDisc?: number;
  stock?: number;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface OrderItem {
  id: string;
  name: string;
  brand: string;
  size: string;
  qty: number;
  price: number;
  mrp: number;
}

export interface Order {
  id: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    street?: string;
    area?: string;
    pincode?: string;
    landmark?: string;
    locationNote?: string;
  };
  geo?: {
    lat: number;
    lng: number;
    accuracy?: number;
    distanceKm?: number;
  };
  items: OrderItem[];
  subtotal: number;
  savings: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  payMethod: 'gpay' | 'upi' | 'cod';
  status: 'Pending' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  upiUtr?: string;
  assignedDriver?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  deliveryZone?: string;
  etaMins?: number;
  etaTimeStr?: string;
}

export interface User {
  role: 'customer' | 'shopowner' | 'delivery';
  name: string;
  phone?: string;
  email?: string;
  store?: string;
  zone?: string;
}

export interface PaymentSettings {
  storeEmail: string;
  supportEmail: string;
  storePin: string;
  upiVpa: string;
  payeeName: string;
  gpayPhone: string;
  phonepeNumber: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  instructions: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  match: string[];
  lat: number;
  lng: number;
  x: number;
  y: number;
  hubDistKm: number;
  etaMins: number;
  defaultDemand: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  count?: number;
}
