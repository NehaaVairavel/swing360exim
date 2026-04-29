import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Clock, MapPin } from 'lucide-react';
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
      className={`product-card group ${isSold ? "opacity-90" : ""}`}
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

        {/* Top Left Year Badge */}
        {product.year && (
          <div className="badge-year">
            {product.year}
          </div>
        )}

        {/* Top Right Badge */}
        {(isSold || product.featured || product.verified !== false) && (
          <div className="badge-verified">
            {isSold ? "SOLD" : product.featured ? "FEATURED" : "VERIFIED"}
          </div>
        )}
      </div>
      
      {/* 2. Content Section */}
      <div className="product-card-content">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-card-name">
            {product.name}
          </h3>
        </Link>

        {/* Small Specs Row */}
        <div className="product-card-specs">
          {product.year && <span>{product.year}</span>}
          {product.year && product.engine_hours && <span className="separator">•</span>}
          {product.engine_hours && (
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              {product.engine_hours} Hrs
            </span>
          )}
          {(product.year || product.engine_hours) && product.location && <span className="separator">•</span>}
          {product.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              {product.location.split(',')[0]}
            </span>
          )}
        </div>

        <div className="product-card-middle-section">
          <div>
            <div className="product-card-label">
              EXPORT PRICE
            </div>
            <div className="product-card-price">
              {displayPrice}
            </div>
          </div>

          {/* Ref Box */}
          <div className="product-card-ref-badge">
            <span className="product-card-ref-label">REF:</span>
            {refNumber}
          </div>
        </div>
        
        {/* Bottom Buttons */}
        <div className="product-card-buttons">
          <Link 
            to={`/product/${product.id}`}
            className="btn-details"
          >
            DETAILS
          </Link>
          <button 
            onClick={(e) => { 
              e.stopPropagation();
              setSelectedProduct(product); 
              setEnquiryOpen(true); 
            }}
            className="btn-enquire pulse-effect"
          >
            <MessageCircle size={18} fill="currentColor" fillOpacity={0.2} />
            ENQUIRE
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;


