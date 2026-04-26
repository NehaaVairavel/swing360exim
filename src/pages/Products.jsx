import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, ArrowRight, Settings, MessageCircle, Heart, Share2, ShieldCheck, Globe, Truck, Users } from "lucide-react";
import productService from "@/services/productService";
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
  const { formatPrice } = useCurrency();
  const images = product.images || [];
  const isSold = product.availability === "sold";

  return (
    <motion.div
      variants={itemVariant}
      layout
      className={`card-marketplace flex flex-col group ${isSold ? "opacity-90" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[24px] bg-slate-100 shrink-0">
        <Link to={`/products/${product.id}`} className="block h-full w-full">
          <img
            src={images[0] || "https://images.unsplash.com/photo-1541888009187-54b38dcd2b31?auto=format&fit=crop&q=80&w=800"}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${isSold ? "grayscale-[0.5]" : "group-hover:scale-105"}`}
            loading="lazy"
          />
        </Link>
        {isSold && (
          <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Sold</div>
        )}
      </div>
      
      <div className="p-[18px] flex flex-col flex-1">
        <h3 className={`font-display font-black text-lg leading-tight mb-1.5 line-clamp-1 ${isSold ? "text-slate-400" : "text-slate-900 group-hover:text-primary transition-colors"}`}>
          {product.name}
        </h3>
        <div className="text-[12px] font-bold text-slate-500 mb-1.5">
          {product.year} | {product.location || 'UAE'}
        </div>
        <div className="text-[12px] font-bold text-slate-500 mb-4">
          Excellent Condition
        </div>
        
        <div className="mt-auto">
          <div className={`font-display font-black text-[22px] tracking-tight mb-4 ${isSold ? "text-slate-300 line-through" : "text-[#030814]"}`}>
            {product.price}
          </div>
          
          <div className="flex gap-2">
            <Link 
              to={`/products/${product.id}`}
              className="flex-1 h-11 bg-slate-100 text-slate-900 rounded-xl font-bold text-[12px] uppercase tracking-widest flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              Details
            </Link>
            <button 
              onClick={() => { setSelectedProduct(product); setEnquiryOpen(true); }}
              className="w-11 h-11 shrink-0 rounded-xl bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle size={18} fill="currentColor" />
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

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await productService.getAll();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      {/* Compact Top Strip */}
      <section className="pt-[120px] pb-12 relative overflow-hidden rounded-b-[24px] border-b border-slate-200/60 shadow-sm" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f7 50%, #e5e7eb 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,.03) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="container-section relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-black text-[#0f172a] mb-2 tracking-tight">
                Certified Heavy Equipment <span className="text-[#f59e0b]">Ready for Export</span>
              </h1>
              <p className="text-slate-600 font-semibold text-[15px]">
                500+ Machines | Dubai Hub | Fast Shipping
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Functional Bar (Sticky) */}
      <div className={`sticky top-[72px] z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 transition-all duration-300 shadow-sm ${scrolled ? 'py-4' : 'py-6'}`}>
        <div className="container-section">
          
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center gap-4 flex-wrap">
            <div className="relative w-[520px] shrink-0">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search machinery..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 h-[58px] bg-white border border-slate-300 rounded-[18px] text-[15px] text-[#0f172a] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-[0_8px_20px_rgba(0,0,0,0.05)] placeholder-slate-500"
              />
            </div>
            
            <select className="w-[150px] h-[58px] px-4 rounded-[16px] border border-slate-300 bg-white text-[13px] font-extrabold uppercase tracking-widest text-slate-700 outline-none hover:border-slate-400 cursor-pointer appearance-none text-center shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
              <option>Sort ▼</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>

            <select className="w-[150px] h-[58px] px-4 rounded-[16px] border border-slate-300 bg-white text-[13px] font-extrabold uppercase tracking-widest text-slate-700 outline-none hover:border-slate-400 cursor-pointer appearance-none text-center shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
              <option>Price ▼</option>
              <option>Any Price</option>
            </select>

            <div className="shrink-0 h-[58px] flex items-center bg-white border border-slate-300 rounded-[16px] px-2 shadow-[0_8px_20px_rgba(0,0,0,0.05)] ml-auto">
              <CurrencyToggle />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex flex-col gap-3 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="relative w-full shrink-0 flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search machinery..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-[42px] bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="h-[42px] px-4 bg-slate-900 text-white rounded-xl font-bold text-[12px] uppercase tracking-widest flex items-center gap-2 shrink-0 shadow-lg"
              >
                <Settings size={16} /> Categories
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              <select className="h-[40px] px-3 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-600 outline-none shrink-0">
                <option>Sort ▼</option>
                <option>Newest</option>
              </select>
              <select className="h-[40px] px-3 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-600 outline-none shrink-0">
                <option>Price ▼</option>
              </select>
              <div className="shrink-0 h-[40px] flex items-center border border-slate-200 rounded-lg bg-slate-50">
                <CurrencyToggle />
              </div>
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
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px] mb-3">Categories</h3>
                <div className="flex flex-col gap-2">
                  {MASTER_CATEGORIES.map((cat) => {
                    const count = getCategoryCount(cat);
                    const isActive = activeCategory === cat;
                    return (
                      <button 
                        key={cat} 
                        onClick={() => { handleCategoryClick(cat); setIsMobileFiltersOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-[14px] font-bold text-[13px] transition-all duration-250 cursor-pointer ${
                          isActive 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_10px_20px_rgba(245,158,11,0.22)] border border-transparent' 
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {cat}
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
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <button onClick={() => setEnquiryOpen(true)} className="h-[46px] px-8 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/20">
              Request Quote
            </button>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp CTA */}
      <a 
        href="https://wa.me/971000000000" 
        target="_blank" 
        rel="noopener noreferrer"
        className="whatsapp-float group"
      >
        <div className="absolute right-full mr-4 bg-white text-[#030814] px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none whitespace-nowrap">
          Enquire on WhatsApp
        </div>
        <MessageCircle size={32} fill="currentColor" />
      </a>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} productName={selectedProduct?.name} product={selectedProduct} />
    </div>
  );
};

export default Products;
