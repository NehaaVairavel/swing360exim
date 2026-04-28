import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, CheckCircle } from 'lucide-react';
import ProductCarousel from '../products/ProductCarousel';

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ProductCard = ({ product, handleDelete, handleMarkSold }) => {
  const isSold = product.availability === "sold";
  const refNumber = product.reference || `SG${product.id ? product.id.substring(product.id.length - 5).toUpperCase() : '36012'}`;

  // Ensure availability string is displayed cleanly
  const statusLabel = product.availability ? product.availability.replace('_', ' ').toUpperCase() : 'ACTIVE';
  const isDraft = product.availability === 'draft';
  const isHidden = product.availability === 'hidden';

  return (
    <motion.div
      variants={itemVariant}
      layout
      style={{ width: "100%", maxWidth: "320px" }}
      className={`relative flex flex-col gap-[10px] rounded-[28px] overflow-hidden bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-250 hover:-translate-y-[6px] group ${isSold ? "opacity-90" : ""} lg:w-[320px] lg:h-[470px]`}
    >
      {/* 1. Image Section (Top) */}
      <div className="relative h-[180px] w-full rounded-t-[28px] overflow-hidden shrink-0">
        <ProductCarousel images={product.images} isSold={isSold} name={product.name} id={product.id} />

        {/* Top Left Admin Status Badge */}
        <div style={{ position: "absolute", top: "16px", left: "16px", background: isSold ? "#f43f5e" : isDraft ? "#64748b" : isHidden ? "#0f172a" : "#10b981", color: "white", padding: "8px 16px", borderRadius: "999px", fontWeight: 800, fontSize: "12px", letterSpacing: "1px", zIndex: 10 }}>
          {statusLabel}
        </div>

        {/* Top Right Badge (Year / Featured) */}
        {(product.year || product.featured) && (
          <div style={{ position: "absolute", top: "16px", right: "16px", background: "white", color: "#111827", padding: "10px 18px", borderRadius: "999px", fontSize: "13px", fontWeight: 800, zIndex: 10 }}>
            {product.featured ? "FEATURED" : product.year}
          </div>
        )}
      </div>
      
      {/* 2. Content Section */}
      <div style={{ padding: "14px 22px 22px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md">{product.category}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.model || 'N/A'}</span>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 style={{ fontSize: "20px", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.4px", color: "#111827", marginTop: 0, marginBottom: "8px" }} className="font-display line-clamp-2 hover:text-amber-500 transition-colors">
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
          {/* Bottom Buttons - Admin Specific */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
            <Link 
              to={`/admin/edit-product/${product.id}`}
              style={{ height: "52px", borderRadius: "16px", border: "1px solid #dbe1ea", background: "white", fontWeight: 800, color: "#111827", fontSize: "14px" }}
              className="flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <Edit size={18} /> Edit
            </Link>
            <button 
              onClick={() => handleDelete(product.id)}
              style={{ height: "52px", borderRadius: "16px", background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", fontWeight: 800, fontSize: "14px" }}
              className="flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
          
          {/* Optional actions row if not sold */}
          {!isSold && (
              <div className="flex justify-center mt-3">
                 <button onClick={() => handleMarkSold(product.id)} className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors">
                     <CheckCircle size={14} /> Mark as Sold
                 </button>
              </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
