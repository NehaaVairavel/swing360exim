import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, ArrowRight, Settings, MessageCircle, Heart, Share2, ShieldCheck, Globe, Truck, Users, RotateCcw, ChevronDown, Eye, Send, LayoutGrid, Tag, MapPin, Clock, DollarSign, CheckCircle2 } from "lucide-react";
import { AllIcon, ExcavatorIcon, BackhoeIcon, DozerIcon, WheelLoaderIcon, GraderIcon, RollerIcon, SkidSteerIcon, BucketIcon, MaterialHandlerIcon, OtherIcon } from "@/components/products/MachineIcons";
import productService from "@/services/productService";
import { socket } from "@/socket";
import EnquiryModal from "@/components/EnquiryModal";
import AnimatedGear from "@/components/AnimatedGear";
import SectionReveal from "@/components/SectionReveal";
import { useCurrency } from "@/context/CurrencyContext";
import settingsService from "@/services/settingsService";
import CurrencyToggle from "@/components/CurrencyToggle";
import ProductCard from "@/components/products/ProductCard";
import { cleanPrice } from "@/utils/priceFormatter";
import "@/styles/cards.css";
import "@/styles/products.css";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const FilterAccordion = ({ title, icon: Icon, children, count = 0, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 last:mb-0 px-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition-all duration-300 group shadow-sm
          ${isOpen ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5'}`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className={`${isOpen ? 'text-primary' : 'text-slate-400 group-hover:text-primary'} transition-colors`} />}
          <span className={`font-sora text-[12px] font-[800] tracking-[3px] uppercase ${isOpen ? 'text-heading' : 'text-slate-600'}`}>{title}</span>
          {count > 0 && (
            <span className="ml-1 bg-orange-50 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-100 animate-in zoom-in-50 duration-300">
              {count}
            </span>
          )}
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden px-4 pb-4 pt-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const titleVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + (i * 0.1),
      duration: 0.6,
      ease: [0.215, 0.610, 0.355, 1.000]
    }
  })
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
  const [modelSearch, setModelSearch] = useState("");
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
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsService.get();
        setSiteSettings(settings);
      } catch (error) {
        console.error("Error fetching settings", error);
      }
    };
    fetchSettings();
  }, []);

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
    if (category !== null) setSelectedCategories(category.split(","));
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
      if (activeSort === "Price Low to High") {
        const pA = parseFloat(cleanPrice(a.price).replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(cleanPrice(b.price).replace(/[^0-9.]/g, '')) || 0;
        return pA - pB;
      }
      if (activeSort === "Price High to Low") {
        const pA = parseFloat(cleanPrice(a.price).replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(cleanPrice(b.price).replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      }
      if (activeSort === "Hours Low to High") {
        return (parseInt(a.engine_hours) || 0) - (parseInt(b.engine_hours) || 0);
      }
      if (activeSort === "Hours High to Low") {
        return (parseInt(b.engine_hours) || 0) - (parseInt(a.engine_hours) || 0);
      }
      if (activeSort === "Brand A-Z") {
        return (a.brand || "").localeCompare(b.brand || "");
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
    setModelSearch("");
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
    <div className="min-h-screen bg-[#F8FAFC] relative font-body antialiased pt-[72px]">
      {/* 1. COMPACT PREMIUM HERO SECTION */}
      <section className="relative pt-[26px] pb-[14px] overflow-hidden bg-gradient-to-b from-white to-[#F8FAFC] border-bottom border-slate-100">
        {/* Visual Depth Elements */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#0B1533_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
        
        {/* Soft blur circles for depth */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="container-section relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full mb-3 shadow-sm"
          >
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Export Hub Catalog</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl md:text-4xl font-display font-black text-heading mb-2 heading-decorated tracking-tight relative">
              Our Heavy <span className="text-gradient drop-shadow-sm">Machinery</span> Fleet
              {/* Subtle glow behind heading */}
              <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full" />
            </h1>
            
            <p className="text-muted-foreground text-[13px] max-w-[520px] mx-auto mt-1 mb-[14px] font-semibold">
              Engineered for performance, curated for global markets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. PREMIUM SEARCH & FILTER TOOLBAR WRAPPER */}
      <section className="sticky top-[80px] z-40 pt-2 pb-3 -mt-2 transition-all duration-300">
        <div className="container-section max-w-[1700px] mx-auto px-4 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 rounded-[32px] shadow-xl border border-orange-300/30 p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(420px,1.8fr)_220px_auto_140px] items-center gap-4 transition-all my-0"
          >
            {/* 1. COMPACT LUXURY SEARCH BAR (White Card) */}
            <div className="relative group w-full h-[48px] transition-all duration-300">
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-[38px] h-[38px] rounded-full bg-slate-50 flex items-center justify-center pointer-events-none group-focus-within:bg-orange-50 transition-colors">
                <Search className="text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search excavators, CAT 320D..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full pl-12 pr-4 bg-white border border-transparent rounded-2xl text-[15px] font-semibold text-heading placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all shadow-md"
              />
            </div>

            {/* 2. ELEGANT STACKED DROPDOWN SORT (White Card) */}
            <div className="relative group w-full h-[48px]">
              <div className="absolute left-4 top-[8px] flex flex-col pointer-events-none z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">SORT BY</span>
              </div>
              <select 
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="w-full pl-4 pr-10 pt-3 h-full bg-white border border-transparent rounded-2xl text-[16px] font-bold text-heading appearance-none outline-none focus:ring-4 focus:ring-white/20 transition-all cursor-pointer shadow-md"
              >
                {["Newest", "Price Low to High", "Price High to Low", "Hours Low to High", "Hours High to Low", "Brand A-Z"].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
            </div>

            {/* 3. CURRENCY TOGGLE (Spacious White Variant) */}
            <CurrencyToggle variant="spacious" />

            {/* 4. RESET BUTTON (White Card) */}
            <button 
              onClick={handleReset}
              className="h-[48px] w-[140px] bg-white text-orange-600 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 mx-auto xl:mx-0 border border-transparent"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </motion.div>
        </div>
      </section>



      <div className="container-section max-w-[1700px] mx-auto pt-0 pb-0 mt-0 px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
          
          <motion.aside 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-[85px] lg:h-[calc(100vh-100px)] lg:overflow-y-auto hide-scrollbar z-30"
          >
            <div className="bg-white/92 backdrop-blur-[14px] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-white/50 flex flex-col overflow-hidden products-sidebar">
              
              <div className="px-6 py-6 border-b border-slate-100 mb-4 bg-slate-50/50">
                <div className="text-[10px] font-black text-slate-400 tracking-[4px] uppercase mb-1">FILTERS</div>
                <h2 className="text-xl font-display font-black text-heading">Refine Search</h2>
              </div>

              <FilterAccordion title="Categories" icon={LayoutGrid} count={selectedCategories.length} defaultOpen={true}>
                <div className="flex flex-wrap gap-2 pt-1">
                  {MASTER_CATEGORIES.filter(c => c !== "All").map(cat => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button 
                        key={cat}
                        onClick={() => {
                          const next = isSelected ? selectedCategories.filter(c => c !== cat) : [...selectedCategories, cat];
                          setSelectedCategories(next);
                        }}
                        className={`px-[14px] h-[38px] flex items-center justify-center rounded-full font-manrope text-[14px] font-semibold transition-all border ${isSelected ? 'bg-gradient-to-r from-[#ffb100] to-[#ff7a00] border-transparent text-white shadow-lg shadow-orange-500/20 -translate-y-0.5' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-white hover:-translate-y-0.5 hover:shadow-md'}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </FilterAccordion>

              <FilterAccordion title="Brands" icon={Tag} count={selectedBrands.length}>
                <div className="flex flex-col gap-2.5 pt-1">
                  {["CAT", "JCB", "Komatsu", "Volvo", "Hyundai", "Doosan", "Hitachi", "Sany"].map(brand => {
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
                        <span className={`font-sora text-[14px] font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`}>{brand}</span>
                      </label>
                    );
                  })}
                </div>
              </FilterAccordion>

              <FilterAccordion title="Location" icon={MapPin} count={selectedLocations.length}>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {["UAE", "India", "Saudi", "Africa", "USA", "Europe"].map(loc => {
                    const isSelected = selectedLocations.includes(loc);
                    return (
                      <button 
                        key={loc}
                        onClick={() => {
                          const next = isSelected ? selectedLocations.filter(l => l !== loc) : [...selectedLocations, loc];
                          setSelectedLocations(next);
                        }}
                        className={`px-2 py-3 rounded-full font-sora text-[12px] font-bold uppercase border transition-all truncate ${isSelected ? 'bg-gradient-to-r from-[#ffb100] to-[#ff7a00] border-transparent text-white shadow-lg shadow-orange-500/20 -translate-y-0.5' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-white hover:-translate-y-0.5'}`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </FilterAccordion>

              <FilterAccordion title="Engine Hours" icon={Clock} count={engineHours > 0 ? 1 : 0}>
                <div className="pb-4 pt-2">
                  <div className="flex justify-between mb-3">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Max Hours</span>
                    <span className="text-[11px] font-bold text-primary">{engineHours} hrs</span>
                  </div>
                  <input 
                    type="range" min="0" max="15000" step="500" value={engineHours}
                    onChange={(e) => setEngineHours(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-[9px] font-black text-slate-300 uppercase">
                    <span>0</span>
                    <span>15,000+</span>
                  </div>
                </div>
              </FilterAccordion>

              <FilterAccordion title="Price Range" icon={DollarSign} count={(minPrice || maxPrice) ? 1 : 0}>
                <div className="grid grid-cols-2 gap-2 pb-4 pt-2">
                  <input 
                    type="number" placeholder="Min" value={minPrice || ""}
                    onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input 
                    type="number" placeholder="Max" value={maxPrice || ""}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-bold outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </FilterAccordion>

              <FilterAccordion title="Condition" icon={CheckCircle2}>
                <div className="flex flex-col gap-2 pb-4 pt-2">
                  {["All", "New", "Used", "Refurbished", "Rental"].map(cond => (
                    <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" name="condition" checked={selectedCondition === cond}
                        onChange={() => setSelectedCondition(cond)}
                        className="w-4 h-4 text-primary focus:ring-primary border-slate-300" 
                      />
                      <span className={`text-[13px] font-semibold transition-colors ${selectedCondition === cond ? 'text-heading' : 'text-slate-500 group-hover:text-heading'}`}>{cond}</span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              <FilterAccordion title="Availability">
                <div className="flex flex-col gap-2 pb-4 pt-2">
                  {["All", "Available", "Sold", "Coming Soon"].map(status => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" name="status" checked={activeStatus === status}
                        onChange={() => setActiveStatus(status)}
                        className="w-4 h-4 text-primary focus:ring-primary border-slate-300" 
                      />
                      <span className={`text-[13px] font-semibold transition-colors ${activeStatus === status ? 'text-heading' : 'text-slate-500 group-hover:text-heading'}`}>{status}</span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              <div className="p-4 border-t border-slate-50 bg-slate-50/50">
                <button 
                  onClick={handleReset}
                  className="w-full h-[40px] bg-white border border-slate-200 text-heading rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </motion.aside>

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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-80"
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

      {/* 5. PREMIUM CTA SECTION (Mirrored from Home page) */}
      <section className="gradient-cta py-5 md:py-7 max-h-[240px] relative overflow-hidden flex items-center rounded-t-[32px] md:rounded-t-[48px]">
        <div className="container-section text-center relative z-20 w-full">
          <SectionReveal>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-black text-white mb-2 drop-shadow-lg tracking-tight">Ready to Upgrade Your Fleet?</h2>
            <p className="text-white/90 mb-3 max-w-[480px] mx-auto text-sm font-semibold drop-shadow-md">Get competitive pricing, global shipping logistics, and expert consultation from our Dubai headquarters.</p>
            <div className="flex flex-col items-center justify-center gap-1.5">
              <a 
                href={`https://wa.me/${siteSettings?.whatsapp || "971558599045"}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2.5 bg-white text-primary px-5 py-2 rounded-xl font-display font-black text-sm hover:scale-[1.03] hover:brightness-105 shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-400 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">Start Your Enquiry <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" /></span>
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              </a>
              <p className="text-white/80 text-[12px] font-semibold tracking-wide text-center">Get instant response from our team</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} productName={selectedProduct?.name} product={selectedProduct} />
    </div>
  );
};

export default Products;
