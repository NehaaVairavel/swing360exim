import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Send } from 'lucide-react';
import ProductCarousel from './ProductCarousel';

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ProductCard = ({ product, setSelectedProduct, setEnquiryOpen }) => {
  const isSold = product.availability === "sold";
  const refNumber = product.reference || `SG${product.id ? product.id.substring(product.id.length - 5).toUpperCase() : '36012'}`;

  return (
    <motion.div
      variants={itemVariant}
      layout
      style={{ width: "100%", maxWidth: "320px" }}
      className={`relative flex flex-col gap-[10px] rounded-[28px] overflow-hidden bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-250 hover:-translate-y-[6px] group ${isSold ? "opacity-90" : ""} lg:w-[320px] lg:h-[470px]`}
    >
      {/* 1. Image Section (Top) */}
      <div className="relative h-[180px] w-full rounded-t-[28px] overflow-hidden shrink-0">
        <ProductCarousel images={product.images || product.image} isSold={isSold} name={product.name} id={product.id} />

        {/* Top Left Year Badge */}
        {product.year && (
          <div style={{ position: "absolute", top: "16px", left: "16px", background: "#f59e0b", color: "white", padding: "8px 16px", borderRadius: "999px", fontWeight: 800, fontSize: "14px", zIndex: 10 }}>
            {product.year}
          </div>
        )}

        {/* Top Right Badge */}
        {(isSold || product.featured || product.verified !== false) && (
          <div style={{ position: "absolute", top: "16px", right: "16px", background: "white", color: "#111827", padding: "10px 18px", borderRadius: "999px", fontSize: "13px", fontWeight: 800, zIndex: 10 }}>
            {isSold ? "SOLD" : product.featured ? "FEATURED" : "VERIFIED"}
          </div>
        )}
      </div>
      
      {/* 2. Content Section */}
      <div style={{ padding: "14px 22px 22px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        <Link to={`/products/${product.id}`}>
          <h3 style={{ fontSize: "20px", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.4px", color: "#111827", marginTop: 0, marginBottom: "8px" }} className="font-display line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex-1 flex flex-col justify-end">
          <div style={{ fontSize: "12px", letterSpacing: "4px", fontWeight: 700, color: "#6b7280", marginBottom: "6px" }}>
            EXPORT PRICE
          </div>
          
          {/* Price Row */}
          <div className="flex items-center justify-between">
            <div style={{ fontSize: "26px", fontWeight: 900, color: "#f59e0b" }} className="font-display">
              {product.price}
            </div>
            
            {/* Ref Box */}
            <div style={{ width: "95px", height: "65px", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontWeight: 800, fontSize: "12px", color: "#111827", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: "10px", color: "#6b7280", letterSpacing: "1px" }}>REF:</span>
              {refNumber}
            </div>
          </div>
        </div>
        
        <div className="mt-auto">
          {/* Bottom Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
            <Link 
              to={`/products/${product.id}`}
              style={{ height: "52px", borderRadius: "16px", border: "1px solid #dbe1ea", background: "white", fontWeight: 800, color: "#111827", fontSize: "14px" }}
              className="flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <Eye size={18} /> Details
            </Link>
            <button 
              onClick={() => { setSelectedProduct(product); setEnquiryOpen(true); }}
              style={{ height: "52px", borderRadius: "16px", background: "linear-gradient(135deg,#f59e0b,#ff9900)", color: "white", fontWeight: 800, boxShadow: "0 14px 24px rgba(245,158,11,.25)", fontSize: "14px" }}
              className="flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <Send size={18} /> Enquire
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
