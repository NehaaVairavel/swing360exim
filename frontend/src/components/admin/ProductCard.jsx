import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, CheckCircle, Star } from 'lucide-react';
import ProductCarousel from '../products/ProductCarousel';

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ProductCard = ({ product, handleDelete, handleMarkSold, handleFeature }) => {
  const isSold = product.availability === "sold";
  const refNumber = product.reference_number || product.reference_no || `EXC-000`;

  // Ensure availability string is displayed cleanly
  const statusLabel = product.availability ? product.availability.replace('_', ' ').toUpperCase() : 'ACTIVE';
  const isDraft = product.availability === 'draft';
  const isHidden = product.availability === 'hidden';

  return (
    <motion.div
      variants={itemVariant}
      layout
      className={`admin-product-card relative flex flex-col bg-white overflow-hidden group ${isSold ? "opacity-90 grayscale-[0.2]" : ""} w-full h-full max-w-[300px] mx-auto`}
    >
      {/* 1. Image Section (Top) */}
      <div className="relative h-[180px] w-full shrink-0">
        <ProductCarousel 
          images={product.images} 
          image={product.image}
          photo={product.photo}
          isSold={isSold} 
          name={product.name} 
          id={product.id} 
          updatedAt={product.updatedAt}
        />

        {/* Top Left Admin Status Badge */}
        <div style={{ position: "absolute", top: "14px", left: "14px", background: isSold ? "#f43f5e" : isDraft ? "#64748b" : isHidden ? "#0f172a" : "#10b981", color: "white", padding: "5px 12px", borderRadius: "999px", fontWeight: 800, fontSize: "10px", letterSpacing: "1px", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {statusLabel}
        </div>

        {/* Top Right Badge (Year / Featured) */}
        {(product.year || product.featured) && (
          <div style={{ position: "absolute", top: "14px", right: "14px", background: "white", color: "#111827", padding: "7px 14px", borderRadius: "999px", fontSize: "11px", fontWeight: 800, zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            {product.featured ? "⭐ FEATURED" : product.year}
          </div>
        )}
      </div>
      
      {/* 2. Content Section */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md">{product.category}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.model || 'N/A'}</span>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="text-[15px] font-display font-black text-slate-900 leading-tight line-clamp-2 hover:text-amber-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex-1 flex flex-col justify-end mt-2">
          {/* Price Row */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Export Price</div>
              <div className="text-xl font-display font-black text-amber-500 leading-none">
                {product.price}
              </div>
            </div>
            
            {/* Ref Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 text-center">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Ref No</span>
              <span className="block text-xs font-black text-slate-700">{refNumber}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-2.5 pt-2.5 border-t border-slate-100">
          {/* Bottom Buttons - Admin Specific */}
          <div className={`grid gap-2.5 ${isSold ? "grid-cols-2" : "grid-cols-2"}`}>
            <Link 
              to={`/admin/edit-product/${product.id}`}
              className="admin-pill-btn admin-pill-btn-edit text-[12px] py-2"
            >
              ✏️ Edit
            </Link>
            <button 
              onClick={() => handleDelete(product.id)}
              className="admin-pill-btn admin-pill-btn-delete text-[12px] py-2"
            >
              🗑️ Delete
            </button>
            
            {!isSold && (
              <>
                <button 
                  onClick={() => handleFeature && handleFeature(product.id, product.featured)}
                  className="admin-pill-btn admin-pill-btn-feature text-[12px] py-2"
                >
                  ⭐ Feature
                </button>
                <button 
                  onClick={() => handleMarkSold(product.id)}
                  className="admin-pill-btn admin-pill-btn-sold text-[12px] py-2"
                >
                  ✔️ Mark Sold
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
