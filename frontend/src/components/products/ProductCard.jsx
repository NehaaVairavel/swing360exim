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
      className={`relative bg-white rounded-[22px] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-all duration-500 group flex flex-col ${isSold ? "opacity-90" : ""}`}
    >
      {/* 1. Image Section (Top) */}
      <div className="relative h-[220px] overflow-hidden shrink-0">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
          <ProductCarousel 
            images={product.images} 
            image={product.image}
            photo={product.photo}
            isSold={isSold} 
            name={product.name} 
            id={product.id}
            updatedAt={product.updatedAt}
          />
        </div>

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="px-3 py-1 bg-white/90 backdrop-blur-md text-heading font-black text-[10px] uppercase tracking-widest rounded-lg shadow-sm border border-slate-200/50 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified
          </div>
          <div className="px-3 py-1 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 border border-primary/20 flex items-center gap-1.5">
            <RotateCcw size={10} className="rotate-180" />
            Ready to Ship
          </div>
        </div>

        {isSold && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-6 py-2 bg-white text-slate-900 font-black text-sm tracking-[0.3em] uppercase rounded-full shadow-2xl">Sold</span>
          </div>
        )}
      </div>
      
      {/* 2. Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-primary uppercase tracking-widest">{product.brand || 'Premium'}</span>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">ID: {refNumber}</span>
          </div>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-xl font-display font-black text-heading leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <Clock size={14} className="text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Usage</span>
              <span className="text-[13px] font-bold text-slate-700">{product.engine_hours || '0'} hrs</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <MapPin size={14} className="text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Location</span>
              <span className="text-[13px] font-bold text-slate-700 truncate">{product.location?.split(',')[0] || 'Dubai'}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Export Price</span>
            <div className="text-3xl font-display font-black text-primary flex items-baseline gap-1">
              {displayPrice}
            </div>
          </div>
          <div className="text-[11px] font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-tighter">
            {product.condition || 'Used'}
          </div>
        </div>
        
        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Link 
            to={`/product/${product.id}`}
            className="flex items-center justify-center h-[46px] rounded-xl border border-slate-200 text-slate-900 font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Details
          </Link>
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              setSelectedProduct(product); 
              setEnquiryOpen(true); 
            }}
            className="flex items-center justify-center gap-2 h-[46px] rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] hover:bg-orange-600 transition-all"
          >
            <MessageCircle size={16} />
            Enquire
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;


