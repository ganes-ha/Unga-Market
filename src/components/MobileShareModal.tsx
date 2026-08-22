import React, { useState, useEffect } from 'react';
import { QrCode, X, Share2, Copy, Check, Smartphone, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

interface MobileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileShareModal: React.FC<MobileShareModalProps> = ({
  isOpen,
  onClose
}) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(currentUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 280,
      color: { dark: '#000000', light: '#FFFFFF' }
    }).then(setQrDataUrl).catch(() => {});
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Unga Market - Wholesale FMCG Direct',
        text: 'Order genuine brand groceries at flat 20% discount with instant Google Pay & UPI payments!',
        url: currentUrl
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-5 text-center space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
            <Smartphone size={14} />
            <span>Mobile Testing &amp; Share</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div>
          <h3 className="font-black text-slate-900 text-base">Open on Your Phone</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan QR code with your iPhone or Android camera to test PWA &amp; GPay
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 inline-block shadow-inner">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="App QR" className="w-52 h-52 mx-auto rounded-xl bg-white p-1" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-400">Loading QR...</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Link ✓' : 'Copy URL'}</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Share2 size={14} />
            <span>Share App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
