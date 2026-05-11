import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, Clock, MapPin, ChevronDown, CheckCircle, AlertCircle, Edit3, Archive } from 'lucide-react';
import { toast } from 'sonner';
import ProductCarousel from '../products/ProductCarousel';
import { cleanPrice } from '@/utils/priceFormatter';
import { useCurrency } from '@/context/CurrencyContext';
import productService from '@/services/productService';
import { useQueryClient } from '@tanstack/react-query';
import '@/styles/cards.css';

const itemVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

/* ── Premium Status Badge ── */
const StatusBadge = ({ status }) => {
  const configs = {
    in_stock: {
      label: "In Stock",
      icon: "🟢",
      bg: "linear-gradient(135deg, #22c55e, #16a34a)",
      shadow: "0 4px 14px rgba(34,197,94,0.40)",
      pulse: true,
    },
    coming_soon: {
      label: "Coming Soon",
      icon: "🟠",
      bg: "linear-gradient(135deg, #f59e0b, #d97706)",
      shadow: "0 4px 14px rgba(245,158,11,0.35)",
      pulse: false,
    },
    sold: {
      label: "Sold",
      icon: "🔴",
      bg: "linear-gradient(135deg, #ef4444, #b91c1c)",
      shadow: "0 4px 14px rgba(239,68,68,0.35)",
      pulse: false,
    },
  };
  const cfg = configs[status] || configs.in_stock;

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        padding: "5px 11px",
        borderRadius: 999,
        background: cfg.bg,
        boxShadow: cfg.shadow,
        display: "flex",
        alignItems: "center",
        gap: 5,
        zIndex: 10,
      }}
    >
      <span style={{ fontSize: 9 }}>{cfg.icon}</span>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 9,
        fontWeight: 800,
        color: "#fff",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        lineHeight: 1,
      }}>
        {cfg.label}
      </span>
      {cfg.pulse && (
        <span style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.85)",
          animation: "badge-pulse 1.8s ease-in-out infinite",
          display: "inline-block",
          marginLeft: 2,
        }} />
      )}
    </div>
  );
};

/* ── Delete Confirmation Modal ── */
const DeleteModal = ({ productName, onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "32px 28px",
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 32px 80px rgba(15,23,42,0.18)",
          textAlign: "center",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: "#FEF2F2", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <AlertCircle size={24} style={{ color: "#EF4444" }} />
        </div>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
          Delete Machine?
        </h3>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#64748B", marginBottom: 6 }}>
          <strong style={{ color: "#374151" }}>{productName}</strong>
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>
          This action cannot be undone. All associated images will be permanently removed.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: 42, borderRadius: 12,
              border: "1px solid #E2E8F0", background: "#F8FAFC",
              fontFamily: "'Inter', sans-serif", fontSize: 13,
              fontWeight: 700, color: "#374151", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: 42, borderRadius: 12,
              border: "none", background: "linear-gradient(135deg, #EF4444, #B91C1C)",
              fontFamily: "'Inter', sans-serif", fontSize: 13,
              fontWeight: 700, color: "#fff", cursor: "pointer",
              boxShadow: "0 6px 18px rgba(239,68,68,0.30)",
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ── Status Dropdown ── */
const StatusDropdown = ({ productId, current, onChanged }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const options = [
    { value: "in_stock", label: "In Stock", icon: "🟢" },
    { value: "coming_soon", label: "Coming Soon", icon: "🟠" },
    { value: "sold", label: "Sold", icon: "🔴" },
  ];

  const handleSelect = async (value) => {
    setOpen(false);
    if (value === current) return;
    try {
      await productService.update(productId, { availability: value });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Status changed to ${options.find(o => o.value === value)?.label}`);
      onChanged?.();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div style={{ position: "relative", gridColumn: "1 / -1" }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className="admin-btn"
        style={{
          width: "100%",
          background: "#F8FAFC",
          color: "#374151",
          border: "1px solid #E2E8F0",
          justifyContent: "center",
          gap: 6,
          fontSize: 11,
        }}
      >
        <span>Change Status</span>
        <ChevronDown size={11} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: 0, right: 0,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 12px 32px rgba(15,23,42,0.14)",
              border: "1px solid #EEF1F5",
              overflow: "hidden",
              zIndex: 100,
            }}
          >
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: current === opt.value ? 800 : 600,
                  color: current === opt.value ? "#111827" : "#374151",
                  background: current === opt.value ? "#F8FAFC" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                onMouseLeave={e => e.currentTarget.style.background = current === opt.value ? "#F8FAFC" : "transparent"}
              >
                <span style={{ fontSize: 12 }}>{opt.icon}</span>
                {opt.label}
                {current === opt.value && <CheckCircle size={11} style={{ marginLeft: "auto", color: "#22C55E" }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Main ProductCard ── */
const ProductCard = ({ product, handleDelete }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isSold = product.availability === "sold";
  const refNumber = product.reference_number || product.reference_no || `EXC-000`;
  const { formatPrice } = useCurrency();
  const priceStr = cleanPrice(product.price);
  const numericValue = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  const displayPrice = formatPrice(numericValue);
  const statusRaw = product.availability || "in_stock";

  const handleCardClick = () => navigate(`/admin/edit-product/${product.id}`);
  const stopProp = (e) => e.stopPropagation();

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      await handleDelete(product.id);
    } catch {
      toast.error("Failed to delete machine");
    }
  };

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          productName={product.name}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <motion.div
        variants={itemVariant}
        layout
        className={`product-card group ${isSold ? "card-sold-state" : ""}`}
        onClick={handleCardClick}
        style={{ cursor: "pointer" }}
      >
        {/* 1. Image Section */}
        <div className="product-card-image-section" onClick={stopProp}>
          <div className={isSold ? "img-sold-overlay" : ""}>
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
          <StatusBadge status={statusRaw} />
          {product.year && (
            <div className="badge-verified">{product.year}</div>
          )}
          {isSold && (
            <div style={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(15,23,42,0.72)",
              backdropFilter: "blur(4px)",
              borderRadius: 999,
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              zIndex: 10,
            }}>
              <Archive size={10} style={{ color: "#94A3B8" }} />
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9,
                fontWeight: 800,
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>Archived Sale</span>
            </div>
          )}
        </div>

        {/* 2. Content Section */}
        <div className="product-card-content">
          <h3 className={`product-card-name ${isSold ? "text-slate-400" : ""}`}>
            {product.name}
          </h3>

          <div className="product-card-specs">
            {product.engine_hours && (
              <span className="flex items-center gap-1">
                <Clock size={11} />{product.engine_hours} Hrs
              </span>
            )}
            {product.engine_hours && product.location && <span className="separator">•</span>}
            {product.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />{product.location.split(',')[0]}
              </span>
            )}
          </div>

          {/* Price + Ref */}
          <div className="product-card-middle-section">
            <div>
              <div className="product-card-label">EXPORT PRICE</div>
              <div className={`product-card-price ${isSold ? "price-strikethrough" : ""}`}>
                {displayPrice}
              </div>
            </div>
            <div className="product-card-ref-badge">
              <span className="product-card-ref-label">REF:</span>
              {refNumber}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="admin-card-buttons" onClick={stopProp}>
            <button
              onClick={() => navigate(`/admin/edit-product/${product.id}`)}
              className="admin-btn admin-btn-edit"
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <Edit3 size={11} /> Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="admin-btn admin-btn-delete"
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <Trash2 size={11} /> Delete
            </button>
            <StatusDropdown
              productId={product.id}
              current={statusRaw}
            />
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes badge-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </>
  );
};

export default ProductCard;
