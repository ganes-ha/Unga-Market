import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onPaymentConfirmed: (orderId: string, utr?: string) => void;
  upiVpa?: string;
  payeeName?: string;
  gpayPhone?: string;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onPaymentConfirmed,
  upiVpa = 'jay.pratap.madhavan@okaxis',
  payeeName = 'Jay Prathap',
  gpayPhone = '9840123456'
}) => {
  const [qrUrl, setQrUrl] = useState<string>('/upi_qr.png');
  const [utr, setUtr] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [loading, setLoading] = useState(true);

  const formattedAmount = amount ? amount.toFixed(2) : '0.00';
  const cleanNote = `Order ${orderId} Unga Market`;
  const universalUpiUri = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const generateQR = async () => {
      // 1. Try Backend dynamic QR
      try {
        const res = await fetch('/api/create-upi-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, orderId, note: cleanNote })
        });
        const data = await res.json();
        if (data.success && (data.qrDataUrl || data.staticQrDataUrl)) {
          setQrUrl(data.qrDataUrl || data.staticQrDataUrl);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Backend QR fetch failed, generating in client:', e);
      }

      // 2. Client-side QR generation
      try {
        const clientQr = await QRCode.toDataURL(universalUpiUri, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          margin: 2,
          width: 360,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        setQrUrl(clientQr);
      } catch (err) {
        console.warn('Client QR error:', err);
        setQrUrl('/upi_qr.png');
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [isOpen, orderId, amount, upiVpa, payeeName]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'vpa' | 'phone') => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    if (type === 'vpa') {
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-emerald-700 px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">💳</span>
            <h3 className="font-extrabold text-sm text-white">UPI Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-emerald-600 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 bg-slate-100 text-center space-y-3">
          {/* GPay Card Container */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            {/* Payee Profile Header */}
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-sm">
                {(payeeName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="font-black text-slate-800 text-base">{payeeName || 'Unga Market'}</div>
            </div>

            {/* QR Container with center emblem */}
            <div className="relative inline-block p-2 bg-white rounded-2xl border border-slate-200 shadow-inner">
              <img
                src={qrUrl}
                alt="UPI QR Code"
                className="w-48 h-48 object-contain mx-auto rounded-lg"
              />
              {/* Center GPay Emblem */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-200 pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.5 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h5.9c-.25 1.36-.99 2.51-2.11 3.28v2.73h3.41c1.99-1.84 3.3-4.55 3.3-8.25z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.41-2.73c-.99.66-2.25 1.05-3.87 1.05-2.98 0-5.5-2.01-6.4-4.71H2.07v2.82C3.88 20.35 7.68 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.6 13.95c-.23-.66-.36-1.37-.36-2.1s.13-1.44.36-2.1V6.93H2.07C1.3 8.46.86 10.18.86 12s.44 3.54 1.21 5.07l3.53-2.72v-.4z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.68 1 3.88 3.65 2.07 7.28l3.53 2.72c.9-2.7 3.42-4.62 6.4-4.62z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
            </div>

            {/* Payee UPI ID with 1-click copy */}
            <div className="mt-2.5">
              <div
                onClick={() => copyToClipboard(upiVpa, 'vpa')}
                className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs font-black text-slate-800 cursor-pointer transition-colors"
                title="Click to Copy UPI ID"
              >
                <span>UPI ID: {upiVpa}</span>
                {copiedVpa ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-bold mt-1">Scan to pay with any UPI app</div>
          </div>

          {/* Amount Badge */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-3.5 py-2 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Total Order Amount:</span>
            <span className="text-xl font-black text-emerald-700">₹{formattedAmount}</span>
          </div>

          {/* Direct Phone Number Transfer */}
          <div className="bg-white border border-blue-200 rounded-xl p-2.5 text-left text-xs space-y-1">
            <div className="flex items-center justify-between text-blue-800 font-extrabold text-[11px]">
              <span className="flex items-center gap-1">
                <Smartphone size={13} />
                <span>Direct Mobile Transfer:</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(gpayPhone, 'phone')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-black cursor-pointer"
              >
                {copiedPhone ? 'Copied ✓' : 'Copy No.'}
              </button>
            </div>
            <div className="font-extrabold text-slate-800 text-xs">
              GPay / PhonePe: <span className="text-slate-900">{gpayPhone}</span>
            </div>
          </div>

          {/* Quick UPI App Deep Links for Mobile */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={universalUpiUri}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black py-2 rounded-xl block transition-all"
            >
              Open GPay
            </a>
            <a
              href={universalUpiUri}
              target="_blank"
              rel="noreferrer"
              className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 text-[11px] font-black py-2 rounded-xl block transition-all"
            >
              PhonePe
            </a>
            <a
              href={universalUpiUri}
              target="_blank"
              rel="noreferrer"
              className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-[11px] font-black py-2 rounded-xl block transition-all"
            >
              Any UPI
            </a>
          </div>

          {/* UTR Input (Optional) */}
          <div className="text-left">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              UPI Reference / UTR Number (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter 12-digit UTR from payment app"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() => onPaymentConfirmed(orderId, utr)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold py-3 rounded-xl shadow-md transition-all text-sm cursor-pointer"
          >
            I Have Completed Payment ✓
          </button>
        </div>
      </div>
    </div>
  );
};
