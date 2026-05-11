import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socket } from "@/socket";
import { Link } from "react-router-dom";
import productService from "@/services/productService";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Filter,
  CheckCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext";
import ProductCard from "@/components/admin/ProductCard";
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
  const { formatPrice } = useCurrency();

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
      toast.success("Machine deleted successfully");
    } catch (error) {
      toast.error("Failed to delete machine");
      throw error;
    }
  };

  const handleMarkSold = async (id) => {
    try {
      await productService.update(id, { availability: "sold" });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Machine marked as sold");
    } catch (error) {
      toast.error("Update failed");
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
      <div className="admin-filter-bar mb-4">
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

        {/* Push view toggle right */}
        <div style={{ marginLeft: "auto" }}>
          <div className="view-toggle">
            <button
              onClick={() => setViewMode("grid")}
              className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
            >
              <List size={15} />
              <span className="hidden sm:inline">Table</span>
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

      {/* ── Grid View ── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}

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
                      <span
                        className={`status-pill ${
                          product.availability === "sold"
                            ? "status-pill-sold"
                            : "status-pill-in-stock"
                        }`}
                      >
                        {product.availability === "sold" ? "Sold" : "In Stock"}
                      </span>
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
      {/* ── Empty state ── */}
      {filteredProducts.length === 0 && (
        <div
          className="admin-card flex flex-col items-center justify-center p-12 text-center"
          style={{ minHeight: "400px", borderRadius: "24px" }}
        >
          <div
            className="flex items-center justify-center mb-4"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "#FEF9EC",
              color: "#F5B301",
            }}
          >
            <Search size={28} />
          </div>
          <p
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            No inventory found
          </p>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#64748B",
            }}
          >
            {searchQuery || activeCategory !== "All" || activeStatus !== "All"
              ? "Try adjusting your search or filter criteria."
              : "Your inventory is currently empty. Add your first machine to get started."}
          </p>
          {(!searchQuery && activeCategory === "All" && activeStatus === "All") && (
            <Link
              to="/admin/add-product"
              className="btn-primary mt-6"
              style={{ textDecoration: "none" }}
            >
              <Plus size={16} />
              Add First Machine
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
