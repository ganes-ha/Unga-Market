import React, { useState } from 'react';
import { Product } from '../types';
import { createProductSVG } from '../utils/packshot';
import { Plus, Minus, Check, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  qty: number;
  onUpdateQty: (product: Product, delta: number) => void;
  onOpenDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  qty,
  onUpdateQty,
  onOpenDetail
}) => {
  const [imgSrc, setImgSrc] = useState<string>(product.img || createProductSVG(product));
  const [imgError, setImgError] = useState(false);

  const handleImgError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(createProductSVG(product));
    }
  };

  const discountPercent = Math.round(((product.m - product.p) / product.m) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      {/* Product Image Area */}
      <div className="relative bg-slate-50 p-3 flex items-center justify-center aspect-square cursor-pointer overflow-hidden" onClick={() => onOpenDetail && onOpenDetail(product)}>
        <img
          src={imgSrc}
          alt={product.n}
          onError={handleImgError}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Wholesale Discount Badge */}
        <div className="absolute top-2 left-2 bg-emerald-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md shadow-xs">
          {discountPercent}% OFF
        </div>

        {/* Brand Tag */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-slate-200">
          {product.b}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            {product.b}
          </div>
          <h4
            className="font-bold text-[14px] text-slate-800 line-clamp-2 leading-snug cursor-pointer hover:text-emerald-700 transition-colors"
            title={product.n}
            onClick={() => onOpenDetail && onOpenDetail(product)}
          >
            {product.n}
          </h4>
          <div className="inline-block bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md mt-1.5">
            Net: {product.s}
          </div>
        </div>

        {/* Pricing & Add to Cart Controls */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-black text-emerald-700">₹{product.p}</span>
              <span className="text-[12px] font-semibold text-slate-400 line-through">₹{product.m}</span>
            </div>
            <div className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5">
              Save ₹{product.disc} / unit
            </div>
          </div>

          {/* Dynamic Quantity Controller */}
          {qty > 0 ? (
            <div className="flex items-center bg-emerald-50 border border-emerald-600 rounded-xl overflow-hidden shadow-xs h-9">
              <button
                type="button"
                onClick={() => onUpdateQty(product, -1)}
                className="w-8 h-full flex items-center justify-center text-emerald-700 font-black hover:bg-emerald-100 active:scale-95 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="w-7 text-center font-black text-[13px] text-emerald-800">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQty(product, 1)}
                className="w-8 h-full flex items-center justify-center text-emerald-700 font-black hover:bg-emerald-100 active:scale-95 transition-all"
                aria-label="Increase quantity"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onUpdateQty(product, 1)}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[12px] px-3.5 h-9 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus size={14} strokeWidth={3} />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
