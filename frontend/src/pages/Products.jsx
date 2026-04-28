import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, ArrowRight, Settings, MessageCircle, Heart, Share2, ShieldCheck, Globe, Truck, Users, RotateCcw, ChevronDown, Eye, Send } from "lucide-react";
import { AllIcon, ExcavatorIcon, BackhoeIcon, DozerIcon, WheelLoaderIcon, GraderIcon, RollerIcon, SkidSteerIcon, BucketIcon, MaterialHandlerIcon, OtherIcon } from "@/components/products/MachineIcons";
import productService from "@/services/productService";
import { socket } from "@/socket";
import EnquiryModal from "@/components/EnquiryModal";
import AnimatedGear from "@/components/AnimatedGear";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencyToggle from "@/components/CurrencyToggle";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const ProductCard = ({ product, setSelectedProduct, setEnquiryOpen }) => {
  const images = product.images || [];
  const isSold = product.availability === "sold";
  const refNumber = product.reference || `SG${product.id ? product.id.substring(product.id.length - 5).toUpperCase() : '36012'}`;

  return (
    <motion.div
      variants={itemVariant}
      layout
      style={{ width: "100%", maxWidth: "380px" }}
      className={`relative flex flex-col rounded-[32px] overflow-hidden bg-white shadow-[0_18px_40px_rgba(0,0,0,0.10)] transition-all duration-250 hover:-translate-y-[6px] group ${isSold ? "opacity-90" : ""} lg:w-[380px] lg:h-[540px]`}
    >
      {/* 1. Image Section (Top) */}
      <div className="relative h-[195px] w-full rounded-t-[32px] overflow-hidden shrink-0">
        <Link to={`/products/${product.id}`} className="block h-full w-full">
          <img
            src={images[0] || "https://images.unsplash.com/photo-1541888009187-54b38dcd2b31?auto=format&fit=crop&q=80&w=800"}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${isSold ? "grayscale-[0.5]" : "group-hover:scale-105"}`}
            loading="lazy"
          />
        </Link>

        {/* Top Left Year Badge */}
        {product.year && (
          <div style={{ position: "absolute", top: "16px", left: "16px", background: "#f59e0b", color: "white", padding: "8px 16px", borderRadius: "999px", fontWeight: 800, fontSize: "14px", zIndex: 10 }}>
            {product.year}
          </div>
        )}

        {/* Top Right Badge */}
        {(isSold || product.featured || product.verified !== false) && (
          <div style={{ position: "absolute", top: "16px", right: "16px", background: "white", color: "#111827", padding: "10px 18px", borderRadius: "999px", fontSize: "13px", fontWeight: 800, zIndex: 10 }}>
            {isSold ? "SOLD" : product.featured ? "FEATURED" : "VERIFIED"}
          </div>
        )}
      </div>
      
      {/* 2. Content Section */}
      <div style={{ padding: "28px 26px", display: "flex", flexDirection: "column", gap: "18px", flex: 1 }}>
        <Link to={`/products/${product.id}`}>
          <h3 style={{ fontSize: "22px", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.4px", color: "#111827" }} className="font-display line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex-1 flex flex-col justify-end">
          <div style={{ fontSize: "12px", letterSpacing: "4px", fontWeight: 700, color: "#6b7280", marginBottom: "6px" }}>
            EXPORT PRICE
          </div>
          
          {/* Price Row */}
          <div className="flex items-center justify-between">
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#f59e0b" }} className="font-display">
              {product.price}
            </div>
            
            {/* Ref Box */}
            <div style={{ width: "110px", height: "78px", borderRadius: "22px", background: "#f8fafc", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontWeight: 800, fontSize: "13px", color: "#111827", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: "11px", color: "#6b7280", letterSpacing: "1px" }}>REF:</span>
              {refNumber}
            </div>
          </div>
        </div>
        
        <div className="mt-auto">
          {/* Bottom Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "10px" }}>
            <Link 
              to={`/products/${product.id}`}
              style={{ height: "58px", borderRadius: "18px", border: "1px solid #dbe1ea", background: "white", fontWeight: 800, color: "#111827" }}
              className="flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <Eye size={18} /> Details
            </Link>
            <button 
              onClick={() => { setSelectedProduct(product); setEnquiryOpen(true); }}
              style={{ height: "58px", borderRadius: "18px", background: "linear-gradient(135deg,#f59e0b,#ff9900)", color: "white", fontWeight: 800, boxShadow: "0 14px 24px rgba(245,158,11,.25)" }}
              className="flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <Send size={18} /> Enquire
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MASTER_CATEGORIES = [
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

const CATEGORY_ICONS = {
  "All": AllIcon,
  "Excavators": ExcavatorIcon,
  "Backhoe Loaders": BackhoeIcon,
  "Dozers": DozerIcon,
  "Wheel Loaders": WheelLoaderIcon,
  "Graders": GraderIcon,
  "Rollers": RollerIcon,
  "Skid Steer": SkidSteerIcon,
  "Buckets": BucketIcon,
  "Material Handlers": MaterialHandlerIcon,
  "Others": OtherIcon
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeSort, setActiveSort] = useState("Newest");
  const [priceRange, setPriceRange] = useState("Any Price");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { data: products = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  useEffect(() => {
    socket.on("products_updated", () => {
      console.log("Real-time update received: Refreshing products...");
      refetch();
    });
    return () => socket.off("products_updated");
  }, [refetch]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    if (search !== null) setSearchQuery(search);
    if (category !== null) setActiveCategory(category);
  }, [searchParams]);

    const filteredProducts = products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
      const matchesSearch = 
        (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.model || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesStatus = true;
      if (activeStatus === "In Stock") {
        matchesStatus = product.availability === "in_stock";
      } else if (activeStatus === "Sold") {
        matchesStatus = product.availability === "sold";
      }
      
      return matchesCategory && matchesSearch && matchesStatus;
    });

  const availableProducts = filteredProducts.filter(p => p.availability === "in_stock");
  const soldProducts = filteredProducts.filter(p => p.availability === "sold");

  const getCategoryCount = (cat) => {
    if (cat === "All") return products.length;
    return products.filter(p => p.category === cat).length;
  };

  const handleReset = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setActiveStatus("All");
    setActiveSort("Newest");
    setPriceRange("Any Price");
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  if (loading) return <div className="pt-40 pb-20 text-center font-display font-bold text-gray-400">Syncing with Dubai Hub...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] relative font-body antialiased">
      {/* Hero Section */}
      <section 
        className="relative border-b border-slate-200/60 shadow-sm" 
        style={{ 
          background: 'linear-gradient(135deg, #eef1f5, #f8fafc, #e9edf2)',
          paddingTop: 'calc(72px + 16px)', // Accounts for fixed navbar + reduced padding
          paddingBottom: '24px',
          textAlign: 'center',
          borderRadius: '0 0 26px 26px',
          overflow: 'hidden'
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        <div className="container-section relative z-10 px-4">
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '11px',
            letterSpacing: '3px',
            fontWeight: '700',
            color: '#d18a00',
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.22)',
            marginBottom: '16px'
          }}>
            EXPORT HUB CATALOG
          </div>
          
          <h1 className="font-display" style={{
            fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: '900',
            lineHeight: '0.95',
            letterSpacing: '-1px',
            color: '#111827'
          }}>
            Our Heavy Machinery<br/>
            <span style={{ color: '#f59e0b' }}>Fleet</span>
          </h1>
          
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            fontStyle: 'italic',
            color: '#6b7280',
            fontWeight: '500',
            marginTop: '12px'
          }}>
            "Engineered for performance, curated for global markets."
          </p>
        </div>
      </section>

      {/* Top Functional Bar (Sticky Unified Toolbar) */}
      <div className={`sticky top-[72px] z-40 transition-all duration-500 ${scrolled ? 'py-2 px-4' : 'py-6 px-0'}`}>
        <div className="container-section max-w-7xl mx-auto">
          
          <div className="bg-white/95 backdrop-blur-[14px] rounded-[22px] p-3.5 shadow-[0_12px_35px_rgba(0,0,0,0.08)] border border-white/50 flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5 transition-all duration-500">
            
            {/* Search Part */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search Excavator, Loader, CAT 320..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 h-[54px] bg-slate-50/50 border border-slate-200 rounded-[16px] text-[16px] font-medium text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-slate-400"
              />
            </div>

            {/* Controls Part */}
            <div className="flex flex-wrap items-center gap-3.5">
              <div className="relative min-w-[140px] group flex-1 sm:flex-none">
                <select 
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="w-full h-[54px] pl-5 pr-10 bg-white border border-slate-200 rounded-[16px] text-[13px] font-bold uppercase tracking-widest text-slate-700 outline-none hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer appearance-none"
                >
                  <option>Sort ▼</option>
                  <option value="Newest">Newest</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative min-w-[140px] group flex-1 sm:flex-none">
                <select 
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-[54px] pl-5 pr-10 bg-white border border-slate-200 rounded-[16px] text-[13px] font-bold uppercase tracking-widest text-slate-700 outline-none hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer appearance-none"
                >
                  <option>Price ▼</option>
                  <option value="Any Price">Any Price</option>
                  <option value="Under $50k">Under $50k</option>
                  <option value="$50k - $100k">$50k - $100k</option>
                  <option value="$100k+">$100k+</option>
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="h-[54px] flex items-center bg-slate-50 border border-slate-200 rounded-[16px] px-1 group-hover:bg-white transition-colors flex-1 sm:flex-none justify-center">
                <CurrencyToggle variant="compact" />
              </div>

              <button 
                onClick={handleReset}
                className="h-[54px] px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[16px] font-bold text-[12px] uppercase tracking-widest transition-all hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 flex items-center gap-2"
              >
                <RotateCcw size={16} />
                <span className="hidden xl:inline">Reset</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="container-section py-8 lg:py-12 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Mobile Filters Drawer Overlay */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Container */}
        <aside className={`fixed inset-y-0 left-0 z-[110] w-[280px] bg-white lg:bg-transparent shadow-2xl lg:shadow-none transition-transform duration-300 lg:translate-x-0 lg:static lg:w-[280px] lg:shrink-0 ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full overflow-y-auto lg:overflow-visible flex flex-col p-6 lg:p-0">
            
            {/* Mobile close button */}
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <span className="font-display font-black text-lg">Filters</span>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="lg:sticky lg:top-[180px] lg:bg-white lg:border lg:border-slate-200 lg:rounded-[24px] lg:p-[22px] lg:shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex flex-col gap-6">
              
              {/* Categories */}
              <div style={{ fontFamily: "'Poppins', sans-serif" }}>
                <style>{"@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap');"}</style>
                <h3 style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase" }} className="text-slate-900 mb-3">CATEGORIES</h3>
                <div className="flex flex-col gap-2">
                  {MASTER_CATEGORIES.map((cat) => {
                    const count = getCategoryCount(cat);
                    const isActive = activeCategory === cat;
                    const Icon = CATEGORY_ICONS[cat] || AllIcon;
                    return (
                      <button 
                        key={cat} 
                        onClick={() => { handleCategoryClick(cat); setIsMobileFiltersOpen(false); }}
                        style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: "0.2px", fontSize: "16px" }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-[14px] transition-all duration-250 cursor-pointer ${
                          isActive 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_10px_20px_rgba(245,158,11,0.22)] border border-transparent' 
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon style={{ width: '24px', height: '24px', flexShrink: 0, marginRight: '12px', fill: 'currentColor', stroke: 'none', color: isActive ? 'white' : '#111827' }} />
                          {cat}
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500 shadow-sm border border-slate-200'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </aside>

        {/* Main Grid Area */}
        <main className="flex-1 min-w-0">
          <div className="space-y-12">
          {availableProducts.length === 0 && soldProducts.length > 0 && activeStatus !== "Sold" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50/50 border border-primary/20 rounded-[2rem] p-8 text-center max-w-2xl mx-auto mb-10">
              <p className="text-[#030814] font-display font-medium text-lg">No available machines currently match your selection. <span className="text-primary font-black">Showing sold units.</span></p>
            </motion.div>
          )}
          
          {filteredProducts.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#dbe3ee] rounded-[2rem] p-16 text-center max-w-3xl mx-auto my-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-2xl font-display font-black text-[#030814] mb-3">No machinery found</h3>
              <p className="text-slate-500 font-medium">We couldn't find any machines matching your current filters or our database is currently offline.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("All"); setActiveStatus("All"); }}
                className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-[13px] uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
              >
                Clear Filters
              </button>
            </motion.div>
          )}

          {/* Active Inventory Grid */}
          {availableProducts.length > 0 && activeStatus !== "Sold" && (
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[28px] justify-items-center w-full">
              <AnimatePresence mode="popLayout">
                {availableProducts.map((product) => <ProductCard key={product.id} product={product} setSelectedProduct={setSelectedProduct} setEnquiryOpen={setEnquiryOpen} />)}
              </AnimatePresence>
            </motion.div>
          )}

          {activeStatus === "All" && availableProducts.length > 0 && soldProducts.length > 0 && (
            <div className="relative pt-16 pb-8">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200" />
              <div className="relative flex justify-center">
                <div className="bg-white border border-slate-200 px-12 py-4 rounded-full shadow-sm"><h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Previously Sold Units</h2></div>
              </div>
            </div>
          )}

          {/* Sold Inventory Grid */}
          {soldProducts.length > 0 && activeStatus !== "Available" && (
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[28px] justify-items-center w-full">
              <AnimatePresence mode="popLayout">
                {soldProducts.map((product) => <ProductCard key={product.id} product={product} setSelectedProduct={setSelectedProduct} setEnquiryOpen={setEnquiryOpen} />)}
              </AnimatePresence>
            </motion.div>
          )}
          </div>
        </main>
      </div>

      {/* Pre-Footer CTA */}
      <section className="py-[70px] bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="container-section text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-slate-900 mb-4 tracking-tight">Need a machine fast?</h2>
          <p className="text-slate-500 mb-8 max-w-[520px] mx-auto text-base md:text-lg font-semibold">Get a custom quotation with shipping costs to your port in under 10 minutes.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://wa.me/971558599045" target="_blank" rel="noopener noreferrer" className="h-[46px] px-8 bg-[#25D366] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2">
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} productName={selectedProduct?.name} product={selectedProduct} />
    </div>
  );
};

export default Products;
