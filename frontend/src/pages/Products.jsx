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
  const [selectedCategories, setSelectedCategories] = useState(searchParams.get("category") ? searchParams.get("category").split(",") : []);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [engineHours, setEngineHours] = useState(15000);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeSort, setActiveSort] = useState("Newest");
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
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesSearch = 
        (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.model || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(product.location);
      const matchesCondition = selectedCondition === "All" || product.condition === selectedCondition;
      
      const hours = parseInt(product.engine_hours) || 0;
      const matchesHours = hours <= engineHours;
      
      const price = parseFloat(cleanPrice(product.price).replace(/[^0-9.]/g, '')) || 0;
      const matchesPrice = price >= minPrice && price <= maxPrice;
      
      return matchesCategory && matchesSearch && matchesBrand && matchesLocation && matchesCondition && matchesHours && matchesPrice;
    }).sort((a, b) => {
      if (activeSort === "Newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (activeSort === "Price: Low to High") {
        const pA = parseFloat(cleanPrice(a.price).replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(cleanPrice(b.price).replace(/[^0-9.]/g, '')) || 0;
        return pA - pB;
      }
      if (activeSort === "Price: High to Low") {
        const pA = parseFloat(cleanPrice(a.price).replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(cleanPrice(b.price).replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      }
      if (activeSort === "Hours: Low to High") {
        return (parseInt(a.engine_hours) || 0) - (parseInt(b.engine_hours) || 0);
      }
      return 0;
    });

    const uniqueModels = [...new Set(products.filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category)).map(p => p.model))].filter(Boolean);
    const filteredUniqueModels = uniqueModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));

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
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedLocations([]);
    setEngineHours(15000);
    setMinPrice(0);
    setMaxPrice(1000000);
    setSelectedCondition("All");
    setActiveStatus("All");
    setActiveSort("Newest");
    setSearchParams(new URLSearchParams());
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

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] pt-[120px]">
      <div className="container-section">
        {/* Skeleton Hero */}
        <div className="w-full h-[200px] bg-white rounded-[32px] mb-12 animate-pulse" />
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Skeleton Sidebar */}
          <div className="w-full lg:w-[320px] h-[600px] bg-white rounded-[22px] animate-pulse shrink-0" />
          
          {/* Skeleton Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-[450px] bg-white rounded-[22px] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative font-body antialiased">
      {/* 1. HERO SECTION */}
      <section className="relative pt-[120px] pb-16 bg-white overflow-hidden">
        {/* Subtle Industrial Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>
        
        <div className="container-section relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] tracking-[0.2em] uppercase mb-6"
          >
            <ShieldCheck size={12} />
            Export Hub Catalog
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-heading mb-6 tracking-tight">
            Our Heavy Machinery <span className="text-gradient drop-shadow-sm">Fleet</span>
          </h1>
          
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-4 italic">
            "Engineered for performance, curated for global markets."
          </p>
        </div>
      </section>

      {/* 2. SEARCH CONTROL BAR (Sticky) */}
      <div 
        className={`sticky top-[72px] z-[40] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg py-3' : 'py-6'}`}
      >
        <div className="container-section max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-3 flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Search Part */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search CAT, JCB, Loader, Excavator..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 h-[52px] bg-slate-50 border-none rounded-xl text-[15px] font-medium text-heading focus:ring-2 focus:ring-primary/20 transition-all placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="relative group">
                <select 
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="pl-4 pr-10 h-[52px] bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 appearance-none outline-none focus:border-primary transition-all cursor-pointer"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Hours: Low to High">Hours: Low to High</option>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Currency */}
              <div className="h-[52px] px-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
                <CurrencyToggle variant="compact" />
              </div>

              {/* Reset */}
              <button 
                onClick={handleReset}
                className="h-[52px] px-5 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-primary transition-all flex items-center gap-2"
                title="Reset Filters"
              >
                <RotateCcw size={16} />
                <span className="hidden lg:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>



      <div className="container-section py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* 3. LEFT SIDEBAR (Premium Filters) */}
          <aside className="w-full lg:w-[320px] shrink-0 sticky top-[160px]">
            <div className="bg-white rounded-[22px] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col gap-8">
              
              {/* Categories */}
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {MASTER_CATEGORIES.filter(c => c !== "All" && c !== "Material Handlers" && c !== "Others").map(cat => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button 
                        key={cat}
                        onClick={() => {
                          const next = isSelected ? selectedCategories.filter(c => c !== cat) : [...selectedCategories, cat];
                          setSelectedCategories(next);
                        }}
                        className={`px-3 py-2 rounded-xl text-[12px] font-bold transition-all border ${isSelected ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/40'}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Top Brands</h3>
                <div className="flex flex-col gap-2">
                  {["CAT", "JCB", "Komatsu", "Volvo", "Hyundai"].map(brand => {
                    const isSelected = selectedBrands.includes(brand);
                    return (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary transition-all"
                          checked={isSelected}
                          onChange={() => {
                            const next = isSelected ? selectedBrands.filter(b => b !== brand) : [...selectedBrands, brand];
                            setSelectedBrands(next);
                          }}
                        />
                        <span className={`text-[14px] font-semibold transition-colors ${isSelected ? 'text-heading' : 'text-slate-500 group-hover:text-heading'}`}>{brand}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Location</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["UAE", "India", "Saudi", "Africa"].map(loc => {
                    const isSelected = selectedLocations.includes(loc);
                    return (
                      <button 
                        key={loc}
                        onClick={() => {
                          const next = isSelected ? selectedLocations.filter(l => l !== loc) : [...selectedLocations, loc];
                          setSelectedLocations(next);
                        }}
                        className={`px-2 py-2 rounded-lg text-[11px] font-bold border transition-all truncate ${isSelected ? 'bg-primary border-primary text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/50'}`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Engine Hours Slider */}
              <div>
                <div className="flex justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Engine Hours</h3>
                  <span className="text-[11px] font-bold text-primary">{engineHours} hrs</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="15000"
                  step="500"
                  value={engineHours}
                  onChange={(e) => setEngineHours(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-2 text-[9px] font-black text-slate-300 uppercase">
                  <span>0 hrs</span>
                  <span>15,000+ hrs</span>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    value={minPrice || ""}
                    onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Max"
                    value={maxPrice || ""}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Condition</h3>
                <div className="flex flex-col gap-2">
                  {["All", "Used", "Refurbished", "Ready Stock"].map(cond => (
                    <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="condition" 
                        checked={selectedCondition === cond}
                        onChange={() => setSelectedCondition(cond)}
                        className="w-4 h-4 text-primary focus:ring-primary border-slate-300" 
                      />
                      <span className={`text-[14px] font-semibold transition-colors ${selectedCondition === cond ? 'text-heading' : 'text-slate-500 group-hover:text-heading'}`}>{cond}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT SIDE PRODUCT GRID */}
          <main className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              /* 4. EMPTY STATE */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-100 rounded-[32px] p-16 text-center shadow-sm"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RotateCcw size={40} className="text-slate-200" />
                </div>
                <h3 className="text-2xl font-display font-black text-heading mb-3">No machinery found</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">Try adjusting filters or search terms to find the perfect equipment for your needs.</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button 
                    onClick={handleReset}
                    className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-[13px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/10"
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-12">
                {/* Active Inventory Grid */}
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {availableProducts.map((product) => (
                      <ProductCard key={product.id} product={product} setSelectedProduct={setSelectedProduct} setEnquiryOpen={setEnquiryOpen} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Previously Sold Units */}
                {activeStatus === "All" && availableProducts.length > 0 && soldProducts.length > 0 && (
                  <div className="relative pt-12">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-100" />
                    <div className="relative flex justify-center">
                      <div className="bg-[#F8FAFC] px-10 py-3 rounded-full border border-slate-100">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Previously Sold Units</h2>
                      </div>
                    </div>
                  </div>
                )}

                {soldProducts.length > 0 && (
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 opacity-80"
                  >
                    <AnimatePresence mode="popLayout">
                      {soldProducts.map((product) => (
                        <ProductCard key={product.id} product={product} setSelectedProduct={setSelectedProduct} setEnquiryOpen={setEnquiryOpen} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 5. EXTRA CONVERSION SECTION */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="container-section text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-black text-heading mb-6 tracking-tight">Ready to Upgrade Your Fleet?</h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10">
              Get competitive pricing, global logistics and expert support from Dubai headquarters.
            </p>
            <button 
              onClick={() => {
                setSelectedProduct({ name: "General Marketplace Inquiry" });
                setEnquiryOpen(true);
              }}
              className="px-10 py-4 bg-primary text-white rounded-xl font-black text-[14px] uppercase tracking-widest hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 transition-all shadow-xl shadow-primary/10"
            >
              Start Enquiry
            </button>
          </motion.div>
        </div>
      </section>
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
