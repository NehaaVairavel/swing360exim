import { useState, useEffect, useMemo } from "react";
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
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext";
import ProductCard from "@/components/admin/ProductCard";
import "@/styles/admin.css";

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: loading, refetch } = useQuery({
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
      console.log("Real-time admin update received...");
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
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesStatus = activeStatus === "All" || product.availability === activeStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, activeCategory, activeStatus, products]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?")) return;
    try {
      await productService.delete(id);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Machine deleted successfully");
    } catch (error) {
      toast.error("Failed to delete machine");
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

  const handleFeature = async (id, currentFeatured) => {
    try {
      await productService.update(id, { featured: !currentFeatured });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Machine ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const categories = ["All", "Excavators", "Dozers", "Loaders", "Graders"];

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading Fleet...</div>;

  return (
    <div className="admin-page-bg -m-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#0F172A] tracking-tight">Products Management</h1>
          <p className="text-slate-500 font-medium mt-1">Total Products: <span className="font-bold text-amber-500">{products.length}</span></p>
        </div>
        <Link 
          to="/admin/add-product" 
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Add New Machine</span>
        </Link>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col xl:flex-row justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
            />
          </div>

          <div className="h-10 w-px bg-slate-200 hidden xl:block mx-2" />

          <div className="flex items-center gap-3">
             <Filter size={16} className="text-slate-400 ml-2" />
             <select 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer hover:text-amber-500 transition-colors"
             >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>

             <select
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer hover:text-amber-500 transition-colors ml-4"
             >
                <option value="All">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="sold">Sold</option>
             </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1.5 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={16} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] justify-items-center">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              handleDelete={handleDelete} 
              handleMarkSold={handleMarkSold}
              handleFeature={handleFeature}
            />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="p-24 flex flex-col items-center justify-center text-slate-500 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Search size={32} className="text-slate-300" />
          </div>
          <p className="text-xl font-display font-bold text-[#0F172A]">No matching machines found</p>
        </div>
      )}
    </div>
  );
};
export default AdminProducts;
