import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socket } from "@/socket";
import { Link } from "react-router-dom";
import productService from "@/services/productService";
import {
  Search, Plus, Trash2, LayoutGrid, List, SlidersHorizontal, X, CheckSquare,
  Edit, Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency, CURRENCY_META } from "@/context/CurrencyContext";
import ProductCard from "@/components/admin/ProductCard";
import { cleanPrice } from "@/utils/priceFormatter";
import { motion, AnimatePresence } from "framer-motion";
import "@/styles/admin.css";
import "@/styles/cards.css";

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const {
    data: products = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["products", "admin"],
    queryFn: () => productService.getAll({ all: true }),
    staleTime: 5_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const { formatPrice, currency, setCurrency, currencies, convertAll, rates } = useCurrency();

  useEffect(() => {
    socket.on("products_updated", () => {
      refetch();
    });
    return () => socket.off("products_updated");
  }, [refetch]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.model || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesStatus =
        activeStatus === "All" || product.availability === activeStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, activeCategory, activeStatus, products]);

  const handleDelete = async (id) => {
    try {
      await productService.delete(id);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast.success("Machine deleted successfully");
    } catch (error) {
      toast.error("Failed to delete machine");
      throw error;
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map(id => productService.delete(id)));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds(new Set());
      toast.success(`${ids.length} machine${ids.length > 1 ? "s" : ""} deleted`);
    } catch { toast.error("Bulk delete failed"); }
  };

  const handleBulkMarkSold = async () => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map(id => productService.update(id, { availability: "sold" })));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setSelectedIds(new Set());
      toast.success(`${ids.length} machine${ids.length > 1 ? "s" : ""} marked as sold`);
    } catch { toast.error("Bulk update failed"); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const categories = [
    "All",
    "Excavators",
    "Backhoe Loaders",
    "Dozers",
    "Wheel Loaders",
    "Graders",
    "Rollers",
    "Skid Steer",
    "Buckets",
    "Material Handlers",
    "Others"
  ];

  if (loading)
    return (
      <div className="admin-loading">
        <span>Loading Fleet...</span>
      </div>
    );

  return (
    <div
      style={{ animation: "fadeIn 0.5s ease" }}
    >
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products Management</h1>
        </div>
        <Link
          to="/admin/add-product"
          className="btn-primary"
          style={{ textDecoration: "none" }}
        >
          <Plus size={17} />
          Add New Machine
        </Link>
      </div>


      {/* ── Filter Bar ── */}
      <div className="admin-filter-bar mb-4" style={{ backdropFilter: "blur(12px)", boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: "240px", maxWidth: "360px" }}>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size={15}
            style={{ color: "#94A3B8" }}
          />
          <input
            type="text"
            placeholder="Search by name or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: "40px" }}
          />
        </div>

        {/* Vertical separator */}
        <div className="hidden xl:block w-px h-8" style={{ background: "#EAECEF" }} />

        {/* Filters */}
        <div className="flex items-center gap-3">
          <SlidersHorizontal size={15} style={{ color: "#94A3B8" }} />
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              background: "transparent",
              border: "none",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="w-px h-5" style={{ background: "#EAECEF" }} />

          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              background: "transparent",
              border: "none",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="All">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="coming_soon">Coming Soon</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        {/* Currency segmented toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, background: "#F1F3F7", borderRadius: 10, padding: 3 }}>
          {["USD", "AED", "EUR", "INR"].map(code => (
            <button
              key={code}
              onClick={() => {
                const found = (currencies || []).find(c => c.code === code);
                if (found) setCurrency(found);
              }}
              style={{
                height: 28, padding: "0 10px", borderRadius: 7, border: "none",
                fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700,
                background: currency?.code === code ? "#fff" : "transparent",
                color: currency?.code === code ? "#111827" : "#94A3B8",
                boxShadow: currency?.code === code ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >{code}</button>
          ))}
        </div>

        {/* Vertical separator */}
        <div className="w-px h-7" style={{ background: "#EAECEF" }} />

        {/* Push view toggle right */}
        <div style={{ marginLeft: "auto" }}>
          <div className="view-toggle">
            <button onClick={() => setViewMode("grid")} className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}>
              <LayoutGrid size={15} /><span className="hidden sm:inline">Grid</span>
            </button>
            <button onClick={() => setViewMode("table")} className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}>
              <List size={15} /><span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Chips ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {activeCategory !== 'All' && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
            <span>Category: {activeCategory}</span>
            <button onClick={() => setActiveCategory('All')} className="hover:text-red-500 ml-1">
              <X size={12} />
            </button>
          </div>
        )}
        {activeStatus !== 'All' && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
            <span>Status: {activeStatus.replace('_', ' ')}</span>
            <button onClick={() => setActiveStatus('All')} className="hover:text-red-500 ml-1">
              <X size={12} />
            </button>
          </div>
        )}
        {searchQuery && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
            <span>Search: "{searchQuery}"</span>
            <button onClick={() => setSearchQuery('')} className="hover:text-red-500 ml-1">
              <X size={12} />
            </button>
          </div>
        )}
        {(activeCategory !== 'All' || activeStatus !== 'All' || searchQuery) && (
          <button 
            onClick={() => {
              setActiveCategory('All');
              setActiveStatus('All');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-amber-500 hover:text-amber-600 px-2 underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Bulk Action Bar ── */}
      {selectedIds.size > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "#111827", borderRadius: 14, padding: "10px 16px",
          marginBottom: 16, animation: "fadeIn 0.2s ease",
        }}>
          <CheckSquare size={16} style={{ color: "#F5B301" }} />
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>
            {selectedIds.size} selected
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button onClick={handleBulkMarkSold}
              style={{ height: 32, padding: "0 14px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Mark Sold
            </button>
            <button onClick={handleBulkDelete}
              style={{ height: 32, padding: "0 14px", borderRadius: 8, border: "none", background: "#EF4444", color: "#fff", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Delete All
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              style={{ height: 32, width: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Select All row ── */}
      {viewMode === "grid" && filteredProducts.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <button onClick={toggleSelectAll}
            style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: "#64748B", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid #CBD5E1", background: selectedIds.size === filteredProducts.length ? "#F5B301" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selectedIds.size === filteredProducts.length && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>}
            </div>
            {selectedIds.size === filteredProducts.length ? "Deselect All" : "Select All"}
          </button>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#94A3B8" }}>
            {filteredProducts.length} machine{filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── Grid View ── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              handleDelete={handleDelete}
              isSelected={selectedIds.has(product.id)}
              onSelect={toggleSelect}
              onHover={setHoveredProduct}
            />
          ))}
        </div>
      )}

      {/* ── Quick Preview Panel ── */}
      <AnimatePresence>
        {hoveredProduct && (
          <motion.div
            key={hoveredProduct.id}
            initial={{ opacity: 0, x: 20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", right: 24, bottom: 24, zIndex: 1000,
              width: 280, background: "#fff",
              borderRadius: 20, border: "1px solid #EEF1F5",
              boxShadow: "0 24px 64px rgba(15,23,42,0.18)",
              overflow: "hidden",
            }}
            onMouseEnter={() => setHoveredProduct(hoveredProduct)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            {/* Image */}
            <div style={{ height: 150, background: "#F1F5F9", position: "relative", overflow: "hidden" }}>
              {(hoveredProduct.images?.[0] || hoveredProduct.image) ? (
                <img
                  src={hoveredProduct.images?.[0] || hoveredProduct.image}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover",
                    filter: hoveredProduct.availability === "sold" ? "grayscale(50%)" : "none" }}
                />
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1" }}>
                  <span style={{ fontSize: 36 }}>📷</span>
                </div>
              )}
              {/* Header badge */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                background: "linear-gradient(to bottom, rgba(15,23,42,0.55), transparent)",
                padding: "10px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em" }}>👁 Quick Preview</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{hoveredProduct.reference_number || hoveredProduct.reference_no || "EXC-000"}</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "12px 14px" }}>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>
                {hoveredProduct.brand} · {hoveredProduct.category}
              </p>
              <h4 style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 6px", lineHeight: 1.2 }}>
                {hoveredProduct.name}
              </h4>

              {/* Description preview */}
              {hoveredProduct.full_description && (
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#64748B", lineHeight: 1.5, margin: "0 0 10px",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {hoveredProduct.full_description}
                </p>
              )}

              {/* Price */}
              <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800,
                    color: hoveredProduct.availability === "sold" ? "#94A3B8" : "#F5B301",
                    textDecoration: hoveredProduct.availability === "sold" ? "line-through" : "none" }}>
                    {formatPrice(parseFloat(cleanPrice(hoveredProduct.price).replace(/[^0-9.]/g, "")) || 0)}
                  </span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>export</span>
                </div>
              </div>

              {/* Currency conversions */}
              {(() => {
                const usdVal = parseFloat(cleanPrice(hoveredProduct.price).replace(/[^0-9.]/g, "")) || 0;
                const convs = usdVal > 0 && typeof convertAll === "function" ? convertAll(usdVal).slice(0, 3) : [];
                return convs.length > 0 ? (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {convs.map(({ currency: c, symbol, flag, value }) => (
                      <div key={c} style={{ background: "#F8FAFC", borderRadius: 7, padding: "3px 8px", border: "1px solid #E2E8F0" }}>
                        <span style={{ fontSize: 9 }}>{flag}</span>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 700, color: "#374151", marginLeft: 3 }}>{symbol}{value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table View ── */}
      {viewMode === "table" && filteredProducts.length > 0 && (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table" style={{ minWidth: "700px" }}>
              <thead>
                <tr>
                  <th className="admin-table-header text-left">Product</th>
                  <th className="admin-table-header text-left">Category</th>
                  <th className="admin-table-header text-left">Status</th>
                  <th className="admin-table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "#F1F3F7",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ color: "#CBD5E1" }}
                            >
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 700,
                              fontSize: "13px",
                              color: "#111827",
                            }}
                          >
                            {product.name}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "11px",
                              color: "#94A3B8",
                            }}
                          >
                            {product.brand} · {product.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        {product.category}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const status = product.availability || "in_stock";
                        const label = status === "in_stock" ? "In Stock" : status === "coming_soon" ? "Coming Soon" : "Sold";
                        const cssClass = `status-pill status-pill-${status.replace("_", "-")}`;
                        return <span className={cssClass}>{label}</span>;
                      })()}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/edit-product/${product.id}`}
                          className="admin-btn-edit"
                          style={{ textDecoration: "none" }}
                        >
                          <Edit size={13} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="admin-btn-delete"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {filteredProducts.length === 0 && (
        <div className="admin-card flex flex-col items-center justify-center text-center"
          style={{ minHeight: "360px", borderRadius: "24px", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {searchQuery || activeCategory !== "All" || activeStatus !== "All" ? "🔍" : "📦"}
          </div>
          <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
            {searchQuery || activeCategory !== "All" || activeStatus !== "All" ? "No results found" : "Your inventory is empty"}
          </p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#64748B", marginBottom: 20, maxWidth: 320 }}>
            {searchQuery || activeCategory !== "All" || activeStatus !== "All"
              ? "Try adjusting your search or filter criteria to find what you're looking for."
              : "Add your first machine to start building your global inventory."}
          </p>
          {(activeCategory !== "All" || activeStatus !== "All" || searchQuery) && (
            <button onClick={() => { setActiveCategory("All"); setActiveStatus("All"); setSearchQuery(""); }}
              style={{ height: 36, padding: "0 18px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#F8FAFC", fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#374151", cursor: "pointer", marginBottom: 10 }}>
              Clear all filters
            </button>
          )}
          {(!searchQuery && activeCategory === "All" && activeStatus === "All") && (
            <Link to="/admin/add-product" className="btn-primary" style={{ textDecoration: "none" }}>
              <Plus size={16} /> Add First Machine
            </Link>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminProducts;
