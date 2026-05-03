import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Clock, MapPin, RotateCcw } from 'lucide-react';
import ProductCarousel from './ProductCarousel';
import { cleanPrice } from '@/utils/priceFormatter';
import { useCurrency } from '@/context/CurrencyContext';
import '@/styles/cards.css';

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ProductCard = ({ product, setSelectedProduct, setEnquiryOpen }) => {
  const navigate = useNavigate();
  const isSold = product.availability === "sold";
  const refNumber = product.reference_number || product.reference_no || `EXC-000`;
  const { formatPrice } = useCurrency();
  const priceStr = cleanPrice(product.price);
  
  // Extract number for formatPrice (removing non-digits except decimals)
  const numericValue = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  const displayPrice = formatPrice(numericValue);

  const handleCardClick = (e) => {
    // Only navigate if it wasn't a click on the Enquiry button or Carousel arrows
    if (e.target.closest('button')) return;
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      variants={itemVariant}
      layout
      onClick={handleCardClick}
      className={`relative bg-white rounded-[22px] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full ${isSold ? "opacity-90" : ""}`}
    >
      {/* 1. Image Section */}
      <div className="relative h-[200px] overflow-hidden shrink-0">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
          <ProductCarousel 
            images={product.images} image={product.image} photo={product.photo}
            isSold={isSold} name={product.name} id={product.id} updatedAt={product.updatedAt}
          />
        </div>

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <div className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-heading font-black text-[9px] uppercase tracking-widest rounded-lg shadow-sm border border-slate-200/50 flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            Verified
          </div>
          <div className="px-2.5 py-1 bg-primary text-white font-black text-[9px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 flex items-center gap-1.5">
            <RotateCcw size={10} className="rotate-180" />
            Ready
          </div>
        </div>

        {isSold && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-6 py-2 bg-white text-slate-900 font-black text-sm tracking-[0.3em] uppercase rounded-full shadow-2xl">Sold</span>
          </div>
        )}
      </div>
      
      {/* 2. Content Section */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{product.brand || 'Premium'}</span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">#{refNumber}</span>
          </div>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-display font-black text-heading leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-50 rounded-lg shrink-0">
              <Clock size={12} className="text-slate-400" />
            </div>
            <span className="text-[12px] font-bold text-slate-600 truncate">{product.engine_hours || '0'} hrs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-50 rounded-lg shrink-0">
              <MapPin size={12} className="text-slate-400" />
            </div>
            <span className="text-[12px] font-bold text-slate-600 truncate">{product.location?.split(',')[0] || 'Dubai'}</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="pt-4 border-t border-slate-50 flex items-end justify-between mb-4">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block">Export Price</span>
              <div className="text-2xl font-display font-black text-primary flex items-baseline gap-1">
                {displayPrice}
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg uppercase">
              {product.condition || 'Used'}
            </div>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link 
              to={`/product/${product.id}`}
              className="flex items-center justify-center h-[42px] rounded-xl border border-slate-200 text-slate-900 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Details
            </Link>
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setEnquiryOpen(true); }}
              className="flex items-center justify-center gap-2 h-[42px] rounded-xl bg-primary text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              <MessageCircle size={14} />
              Enquire
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;


