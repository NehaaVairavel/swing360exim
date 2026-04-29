import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Edit, Trash2, CheckCircle, Star } from 'lucide-react';
import ProductCarousel from '../products/ProductCarousel';
import '@/styles/cards.css';

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ProductCard = ({ product, handleDelete, handleMarkSold, handleFeature }) => {
  const isSold = product.availability === "sold";
  const refNumber = product.reference_number || product.reference_no || `EXC-000`;

  // Ensure availability string is displayed cleanly
  const statusLabel = product.availability ? product.availability.replace('_', ' ').toUpperCase() : 'ACTIVE';

  return (
    <motion.div
      variants={itemVariant}
      layout
      className={`product-card group ${isSold ? "opacity-90 grayscale-[0.2]" : ""}`}
    >
      {/* 1. Image Section (Top) */}
      <div className="product-card-image-section">
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
        <div 
          className="badge-year" 
          style={{ background: isSold ? "#f43f5e" : "#10b981", padding: "5px 12px", fontSize: "10px" }}
        >
          {statusLabel}
        </div>

        {/* Top Right Badge (Year / Featured) */}
        {(product.year || product.featured) && (
          <div className="badge-verified">
            {product.featured ? "⭐ FEATURED" : product.year}
          </div>
        )}
      </div>
      
      {/* 2. Content Section */}
      <div className="product-card-content">
        <Link to={`/admin/edit-product/${product.id}`}>
          <h3 className="product-card-name">
            {product.name}
          </h3>
        </Link>
        
        <div className="product-card-middle-section">
          <div>
            <div className="product-card-label">
              EXPORT PRICE
            </div>
            <div className="product-card-price">
              {product.price}
            </div>
          </div>

          {/* Ref Box */}
          <div className="product-card-ref-badge">
            <span className="product-card-ref-label">REF:</span>
            {refNumber}
          </div>
        </div>
        
        {/* Bottom Buttons - Admin Specific */}
        <div className="admin-card-buttons">
          <Link 
            to={`/admin/edit-product/${product.id}`}
            className="admin-btn admin-btn-edit"
          >
            <Edit size={14} /> Edit
          </Link>
          <button 
            onClick={() => handleDelete(product.id)}
            className="admin-btn admin-btn-delete"
          >
            <Trash2 size={14} /> Delete
          </button>
          
          {!isSold && (
            <>
              <button 
                onClick={() => handleFeature && handleFeature(product.id, product.featured)}
                className="admin-btn admin-btn-feature"
              >
                <Star size={14} /> Feature
              </button>
              <button 
                onClick={() => handleMarkSold(product.id)}
                className="admin-btn admin-btn-sold"
              >
                <CheckCircle size={14} /> Sold
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;


