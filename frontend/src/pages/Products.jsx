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
import ProductCard from "@/components/products/ProductCard";
import "@/styles/cards.css";
import "@/styles/products.css";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
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

  const normalizeAvailability = (value) => {
    const v = (value ?? "").toString().trim().toLowerCase();
    if (v === "sold") return "sold";
    if (v === "in_stock" || v === "in stock" || v === "available") return "in_stock";
    if (v === "coming_soon" || v === "coming soon") return "coming_soon";
    return v || "in_stock";
  };

  const [realtimeConnected, setRealtimeConnected] = useState(socket.connected);
  useEffect(() => {
    const onConnect = () => setRealtimeConnected(true);
    const onDisconnect = () => setRealtimeConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const { data: products = [], isLoading: loading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
    // Override global defaults: keep product list fairly fresh, but still cached for fast navigation.
    staleTime: 10_000,
    // Critical for instant admin->main sync:
    // when admin invalidates ["products"], navigating to this page must refetch without manual refresh.
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    // Socket.IO should handle real-time updates; if not connected, poll as a fallback
    // so new admin-added products appear without a manual refresh.
    refetchInterval: realtimeConnected ? false : 1000,
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
        matchesStatus = normalizeAvailability(product.availability) === "in_stock";
      } else if (activeStatus === "Sold") {
        matchesStatus = normalizeAvailability(product.availability) === "sold";
      }
      
      return matchesCategory && matchesSearch && matchesStatus;
    });

  // Main grid should show newly-added products immediately, even if they are "coming_soon".
  // Keep sold items separated in the existing "Previously Sold Units" section.
  const availableProducts = filteredProducts.filter(p => normalizeAvailability(p.availability) !== "sold");
  const soldProducts = filteredProducts.filter(p => normalizeAvailability(p.availability) === "sold");

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
    <div className="min-h-screen bg-[#f3f6fa] relative font-body antialiased">
      {/* Hero Section */}
      <section 
        className="relative border-b border-slate-200/60 shadow-sm" 
        style={{ 
          background: 'linear-gradient(135deg, #eef1f5, #f8fafc, #e9edf2)',
          paddingTop: 'calc(72px + 8px)', /* Reduced height further by 20% */
          paddingBottom: '12px',
          textAlign: 'center',
          borderRadius: '0 0 16px 16px',
          overflow: 'hidden'
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        <div className="container-section relative z-10 px-4">
          <div style={{
            display: 'inline-block',
            padding: '4px 12px', /* Reduced from 6px 14px */
            borderRadius: '999px',
            fontSize: '10px', /* Reduced from 11px */
            letterSpacing: '2px', /* Reduced from 3px */
            fontWeight: '700',
            color: '#d18a00',
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.22)',
            marginBottom: '12px' /* Reduced from 16px */
          }}>
            EXPORT HUB CATALOG
          </div>
          
          <h1 className="font-display" style={{
            fontSize: 'clamp(28px, 4vw, 54px)', /* Reduced from clamp(32px, 5vw, 64px) */
            fontWeight: '900',
            lineHeight: '0.95',
            letterSpacing: '-1px',
            color: '#111827'
          }}>
            Our Heavy Machinery<br/>
            <span style={{ color: '#f59e0b' }}>Fleet</span>
          </h1>
          
          <p style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)', /* Reduced from clamp(16px, 2vw, 20px) */
            fontStyle: 'italic',
            color: '#6b7280',
            fontWeight: '500',
            marginTop: '8px' /* Reduced from 12px */
          }}>
            "Engineered for performance, curated for global markets."
          </p>
        </div>
      </section>

      {/* Top Functional Bar (Sticky Unified Toolbar) */}
      <div 
        className={`products-filter-toolbar ${scrolled ? 'scrolled' : ''} container-section max-w-7xl mx-auto`}
        style={{ transform: 'none', transition: 'none', willChange: 'auto', backfaceVisibility: 'hidden' }}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
            
            {/* Search Part */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search CAT, JCB, Loader..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 h-[48px] bg-slate-50/50 border border-slate-200 rounded-[12px] text-[15px] font-medium text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder-slate-400"
              />
            </div>

            {/* Controls Part */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[130px] group flex-1 sm:flex-none">
                <select 
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="w-full h-[48px] pl-4 pr-10 bg-white border border-slate-200 rounded-[12px] text-[12px] font-bold uppercase tracking-wider text-slate-700 outline-none hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer appearance-none"
                >
                  <option>Sort ▼</option>
                  <option value="Newest">Newest</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative min-w-[130px] group flex-1 sm:flex-none">
                <select 
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-[48px] pl-4 pr-10 bg-white border border-slate-200 rounded-[12px] text-[12px] font-bold uppercase tracking-wider text-slate-700 outline-none hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all cursor-pointer appearance-none"
                >
                  <option>Price ▼</option>
                  <option value="Any Price">Any Price</option>
                  <option value="Under $50k">Under $50k</option>
                  <option value="$50k - $100k">$50k - $100k</option>
                  <option value="$100k+">$100k+</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              <div className="h-[48px] flex items-center bg-slate-50 border border-slate-200 rounded-[12px] px-1 group-hover:bg-white transition-colors flex-1 sm:flex-none justify-center">
                <CurrencyToggle variant="compact" />
              </div>

              <button 
                onClick={handleReset}
                className="h-[48px] px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[12px] font-bold text-[11px] uppercase tracking-wider transition-all hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 flex items-center gap-2"
              >
                <RotateCcw size={16} />
                <span className="hidden xl:inline">Reset</span>
              </button>
            </div>
          </div>

      </div>

      <div className="products-layout-container py-6 lg:py-8">
        <div className="products-main-content relative z-10">
        
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
        <aside className={`products-sidebar ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="h-full overflow-y-auto lg:overflow-visible flex flex-col p-6 lg:p-0">
            
            {/* Mobile close button */}
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <span className="font-display font-black text-lg">Filters</span>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="lg:sticky lg:top-[160px] lg:bg-white lg:border lg:border-[#EEF1F5] lg:rounded-[20px] lg:p-[18px] lg:shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex flex-col gap-5">
              
              {/* Categories */}
              <div style={{ fontFamily: "'Poppins', sans-serif" }}>
                <style>{"@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap');"}</style>
                <h3 style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }} className="text-slate-900 mb-2.5">CATEGORIES</h3>
                <div className="flex flex-col gap-1.5">
                  {MASTER_CATEGORIES.map((cat) => {
                    const count = getCategoryCount(cat);
                    const isActive = activeCategory === cat;
                    const Icon = CATEGORY_ICONS[cat] || AllIcon;
                    return (
                      <button 
                        key={cat} 
                        onClick={() => { handleCategoryClick(cat); setIsMobileFiltersOpen(false); }}
                        style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, letterSpacing: "0.1px", fontSize: "15px", minHeight: "52px", marginBottom: "6px" }}
                        className={`w-full flex items-center justify-between gap-[10px] px-[14px] py-[8px] rounded-[14px] transition-all duration-250 cursor-pointer category-btn ${
                          isActive 
                            ? 'bg-white shadow-sm border border-slate-200 active' 
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-[12px] min-w-0 flex-1">
                          <Icon style={{ width: '18px', height: '18px', flexShrink: 0, fill: 'currentColor', stroke: 'none', color: isActive ? 'white' : '#111827' }} />
                          <span className="whitespace-normal overflow-hidden leading-[1.2] text-left max-w-[140px]">
                            {cat}
                          </span>
                        </div>
                        <span className={`ml-auto shrink-0 flex items-center justify-center w-[26px] h-[26px] text-[12px] font-black rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500 shadow-sm border border-slate-200'}`}>
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
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="products-grid">
              <AnimatePresence mode="popLayout">
                {availableProducts.map((product) => <ProductCard key={product.id} product={product} setSelectedProduct={setSelectedProduct} setEnquiryOpen={setEnquiryOpen} />)}
              </AnimatePresence>
            </motion.div>
          )}

          {activeStatus === "All" && availableProducts.length > 0 && soldProducts.length > 0 && (
            <div className="relative pt-12 pb-6">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200" />
              <div className="relative flex justify-center">
                <div className="bg-white border border-slate-200 px-10 py-3 rounded-full shadow-sm"><h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Previously Sold Units</h2></div>
              </div>
            </div>
          )}

          {/* Sold Inventory Grid */}
          {soldProducts.length > 0 && activeStatus !== "Available" && (
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="products-grid">
              <AnimatePresence mode="popLayout">
                {soldProducts.map((product) => <ProductCard key={product.id} product={product} setSelectedProduct={setSelectedProduct} setEnquiryOpen={setEnquiryOpen} />)}
              </AnimatePresence>
            </motion.div>
          )}
          </div>
        </main>
      </div>
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
