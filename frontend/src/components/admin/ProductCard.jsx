import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, CheckCircle, Clock, MapPin } from 'lucide-react';
import ProductCarousel from '../products/ProductCarousel';
import { cleanPrice } from '@/utils/priceFormatter';
import { useCurrency } from '@/context/CurrencyContext';
import '@/styles/cards.css';

const itemVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const ProductCard = ({ product, handleDelete, handleMarkSold }) => {
  const navigate = useNavigate();
  const isSold = product.availability === "sold";
  const refNumber = product.reference_number || product.reference_no || `EXC-000`;
  const { formatPrice } = useCurrency();
  const priceStr = cleanPrice(product.price);
  const numericValue = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  const displayPrice = formatPrice(numericValue);
  const statusRaw = product.availability || "in_stock";
  const statusLabel = statusRaw.replace('_', ' ').toUpperCase();

  const handleCardClick = () => {
    navigate(`/admin/edit-product/${product.id}`);
  };

  const stopProp = (e) => e.stopPropagation();

  return (
    <motion.div
      variants={itemVariant}
      layout
      className={`product-card group ${isSold ? "opacity-90 grayscale-[0.15]" : ""}`}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {/* 1. Image Section */}
      <div className="product-card-image-section" onClick={stopProp}>
        <ProductCarousel
          images={product.images}
          image={product.image}
          photo={product.photo}
          isSold={isSold}
          name={product.name}
          id={product.id}
          updatedAt={product.updatedAt}
        />

        {/* Status badge */}
        <div className={`badge-status ${statusRaw}`}>
          {statusLabel}
        </div>

        {/* Year badge */}
        {product.year && (
          <div className="badge-verified">
            {product.year}
          </div>
        )}
      </div>

      {/* 2. Content Section */}
      <div className="product-card-content">
        <h3 className="product-card-name">
          {product.name}
        </h3>

        {/* Specs row */}
        <div className="product-card-specs">
          {product.engine_hours && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {product.engine_hours} Hrs
            </span>
          )}
          {product.engine_hours && product.location && <span className="separator">•</span>}
          {product.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {product.location.split(',')[0]}
            </span>
          )}
        </div>

        {/* Price + Ref */}
        <div className="product-card-middle-section">
          <div>
            <div className="product-card-label">EXPORT PRICE</div>
            <div className="product-card-price">{displayPrice}</div>
          </div>
          <div className="product-card-ref-badge">
            <span className="product-card-ref-label">REF:</span>
            {refNumber}
          </div>
        </div>

        {/* Action buttons — stop propagation so card click doesn't fire */}
        <div className="admin-card-buttons" onClick={stopProp}>
          <button
            onClick={() => navigate(`/admin/edit-product/${product.id}`)}
            className="admin-btn admin-btn-edit"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(product.id)}
            className="admin-btn admin-btn-delete"
          >
            <Trash2 size={12} /> Delete
          </button>
          {!isSold && (
            <button
              onClick={() => handleMarkSold(product.id)}
              className="admin-btn admin-btn-sold"
              style={{ gridColumn: "1 / -1" }}
            >
              <CheckCircle size={12} /> Mark as Sold
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
