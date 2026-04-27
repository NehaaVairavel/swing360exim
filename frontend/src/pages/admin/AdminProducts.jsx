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

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["products", "admin"],
    queryFn: () => productService.getAll({ all: true }),
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

  const categories = ["All", "Excavators", "Dozers", "Loaders", "Graders"];

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading Fleet...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#0F172A] tracking-tight">Machine Inventory</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track your global heavy equipment fleet</p>
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
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isSold = product.availability === "sold";
            return (
              <div key={product.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col group relative">
                <div className="h-56 bg-slate-100 relative overflow-hidden">
                  <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                    isSold ? 'bg-rose-50 text-rose-600 border-rose-200/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
                  }`}>
                    {product.availability}
                  </div>
                  
                  {product.images?.[0] ? (
                    <img src={product.images?.[0] || "https://images.unsplash.com/photo-1541888009187-54b38dcd2b31?auto=format&fit=crop&q=80&w=800"} alt={product.name} className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${isSold ? 'grayscale-[50%] opacity-80' : ''}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200"><ImageIcon size={48} /></div>
                  )}
                  
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button className="p-3 bg-white rounded-xl text-[#0F172A] hover:bg-amber-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"><Eye size={20} /></button>
                    <button className="p-3 bg-white rounded-xl text-[#0F172A] hover:bg-amber-500 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"><Edit size={20} /></button>
                    {!isSold && <button onClick={() => handleMarkSold(product.id)} className="p-3 bg-emerald-500 rounded-xl text-white hover:bg-emerald-600 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-150" title="Mark as Sold"><CheckCircle size={20} /></button>}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md">{product.category}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.model || 'N/A'}</span>
                  </div>
                  <h3 className={`font-display font-bold text-lg mb-4 line-clamp-2 leading-snug ${isSold ? 'text-slate-400' : 'text-[#0F172A] group-hover:text-amber-600 transition-colors'}`}>
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Price</p>
                       <p className={`font-display font-black text-xl ${isSold ? 'text-slate-400 line-through' : 'text-[#0F172A]'}`}>
                        {product.price}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            );
          })}
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
