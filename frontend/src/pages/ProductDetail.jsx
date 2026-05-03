import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquare, 
  Tag, 
  ShieldCheck,
  Share2,
  ChevronRight,
  ChevronLeft,
  Globe,
  MapPin,
  Phone,
  Hash,
  Clock,
  Settings,
  Info
} from "lucide-react";
import { useState, useEffect } from "react";
import productService from "@/services/productService";
import EnquiryModal from "@/components/EnquiryModal";
import AnimatedGear from "@/components/AnimatedGear";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencyToggle from "@/components/CurrencyToggle";
import { cleanPrice } from "@/utils/priceFormatter";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [activeImage, setActiveImage] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        let data;
        // Try fetching by ID first
        try {
          data = await productService.getById(id);
        } catch (e) {
          // If ID fetch fails (e.g. invalid ObjectId), try fetching by Ref
          data = await productService.getByRef(id);
        }
        
        if (data) {
          setProduct(data);
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Swing360 Machine',
        text: `Check out this ${product?.name} on Swing360`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const images = product?.images || [];
  const isSold = product?.availability === "sold";
  const refNumber = product?.reference_number || product?.reference_no || `EXC-000`;

  const nextImage = () => {
    setDirection(1);
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <AnimatedGear size={80} className="text-primary/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
      <p className="mt-6 font-display font-black text-heading/40 uppercase tracking-[0.2em] text-xs">Loading Machine Specs...</p>
    </div>
  );

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
            <Info size={40} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-display font-black text-heading mb-4 tracking-tight">Machine Not Found</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">The machine you are looking for might have been sold or removed from our catalog.</p>
          <Link to="/products" className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all inline-flex items-center gap-3">
            <ArrowLeft size={18} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const specifications = [
    { label: "Category", value: product.category, icon: Tag },
    { label: "Brand", value: product.brand, icon: Settings },
    { label: "Model Number", value: product.model, icon: Info },
    { label: "Year", value: product.year, icon: Clock },
    { label: "Condition", value: product.condition || "Used - Good", icon: ShieldCheck },
    { label: "Engine Hours", value: product.engine_hours || "N/A", icon: Clock },
    { label: "Location", value: product.location || "Dubai, UAE", icon: MapPin },
    { label: "Reference No", value: refNumber, icon: Hash },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] relative pt-24 pb-24 font-jakarta">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[600px] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-accent/[0.04] blur-[100px] pointer-events-none" />

      <div className="container-section relative z-10">
        {/* Breadcrumbs & Actions */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
          <Link to="/products" className="flex items-center gap-3 text-heading/40 hover:text-primary transition-all font-bold uppercase tracking-widest text-[16px] group">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
              <ArrowLeft size={18} />
            </div>
            Back to Global Inventory
          </Link>
          
          <div className="flex gap-3">
             <button onClick={handleShareLink} className="h-11 px-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 hover:bg-primary/5 text-heading/60 hover:text-primary transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
               {isCopied ? <><CheckCircle2 size={16} className="text-green-500" /> Copied</> : <><Share2 size={16} /> Share Machine</>}
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[58%_1fr] gap-10 lg:gap-16 items-start">
          {/* Left Column: Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="relative aspect-[16/11] rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] group"
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={activeImage}
                  src={images[activeImage] || "https://images.unsplash.com/photo-1541888009187-54b38dcd2b31?auto=format&fit=crop&q=80&w=1200"}
                  custom={direction}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 flex justify-between z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="w-12 h-12 rounded-full bg-white/95 backdrop-blur shadow-xl flex items-center justify-center text-heading hover:bg-primary hover:text-white transition-all pointer-events-auto active:scale-95">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="w-12 h-12 rounded-full bg-white/95 backdrop-blur shadow-xl flex items-center justify-center text-heading hover:bg-primary hover:text-white transition-all pointer-events-auto active:scale-95">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
              
              {/* Image Badges */}
              <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
                <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-xl border border-white/50">
                  <ShieldCheck className="text-primary" size={20} />
                  <span className="text-[11px] font-black text-heading uppercase tracking-[0.2em]">Verified Inspection</span>
                </div>
                {isSold && (
                  <div className="bg-rose-500 text-white px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-xl font-black uppercase tracking-[0.2em] text-[11px]">
                    Sold Out
                  </div>
                )}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>

            {/* Thumbnail Slider */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => { setDirection(idx > activeImage ? 1 : -1); setActiveImage(idx); }} 
                  className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all duration-300 relative group ${activeImage === idx ? 'border-primary shadow-lg scale-105 z-10' : 'border-white bg-gray-50 opacity-60 hover:opacity-100 hover:border-primary/30'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Info & CTAs */}
          <div className="flex flex-col">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-[2px]">{product.category}</span>
                <span className="bg-gray-100 text-[#94a3b8] px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-[2px] flex items-center gap-2">
                  <Hash size={12} /> Reference No: {refNumber}
                </span>
              </div>

              <h1 className="text-[30px] lg:text-[46px] font-extrabold text-[#0b1324] mb-4 leading-[1.05] tracking-[-1px]">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                  <MapPin size={16} className="text-primary" />
                  {product.location || "Dubai, UAE"}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                  <Clock size={16} className="text-primary" />
                  Ready for Export
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-1000">
                  <AnimatedGear size={160} />
                </div>
                
                <div className="relative z-10">
                  <span className="text-primary text-[11px] uppercase font-extrabold tracking-[2px] mb-2 block">Premium Export Price</span>
                  <div className="flex items-end justify-between gap-4">
                    <h2 className={`text-[42px] lg:text-[56px] font-black tracking-[-1px] leading-none transition-all duration-300 ${isSold ? "text-gray-300 line-through" : "text-[#f59e0b]"}`}>
                      {cleanPrice(product.price)}
                    </h2>
                    <div className="flex flex-col items-end pb-1">
                      <CurrencyToggle />
                      <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">USD / AED / EUR</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Grid */}
              <div className="grid grid-cols-2 gap-3 mb-10">
                {specifications.map((spec, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-primary/20 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                      <spec.icon size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-extrabold uppercase tracking-[2px] text-[#94a3b8] mb-0.5">{spec.label}</span>
                      <span className="text-[18px] font-bold text-[#111827] leading-none">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => !isSold && setEnquiryOpen(true)}
                    disabled={isSold}
                    className={`h-16 flex items-center justify-center gap-3 rounded-2xl font-extrabold uppercase tracking-[1px] text-[15px] transition-all duration-300 ${isSold ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-primary text-white shadow-xl shadow-primary/30 hover:-translate-y-1 hover:shadow-2xl"}`}
                  >
                    <MessageSquare size={20} /> {isSold ? "Machine Sold" : "Enquire Now"}
                  </button>
                  
                  <a 
                    href={`tel:+918778868739`}
                    className="h-16 flex items-center justify-center gap-3 rounded-2xl bg-white border-2 border-gray-100 font-extrabold uppercase tracking-[1px] text-[15px] text-heading hover:border-primary hover:text-primary hover:-translate-y-1 transition-all"
                  >
                    <Phone size={20} /> Call Now
                  </a>
                </div>

                <a 
                  href={`https://wa.me/918778868739?text=Hi, I am interested in ${product.name} (Ref: ${refNumber})`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`w-full h-14 flex items-center justify-center gap-3 rounded-2xl transition-all duration-300 font-extrabold uppercase tracking-[1px] text-[15px] ${isSold ? "opacity-50 pointer-events-none" : "bg-[#25D366]/10 border border-[#25D366]/20 text-[#1a9e4d] hover:bg-[#25D366] hover:text-white"}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Description Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="flex items-center gap-6 mb-10">
            <h2 className="text-[24px] lg:text-[30px] font-extrabold text-[#0f172a] tracking-tight leading-[1.2] whitespace-nowrap">Technical Description</h2>
            <div className="h-px w-full bg-gray-100" />
          </div>
          
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm">
            <div className="prose prose-slate max-w-none">
              <p className="text-[#475569] font-medium leading-[1.8] text-[17px] whitespace-pre-line">
                {product.full_description || product.short_description || "Detailed technical specifications for this machine are available upon request. Our team has thoroughly inspected this unit to ensure it meets global export standards."}
              </p>
            </div>
            
            <div className="mt-12 grid sm:grid-cols-3 gap-8 pt-10 border-t border-gray-50">
              {[
                { label: "Inspection Status", value: "360° Certified", icon: ShieldCheck },
                { label: "Transit Status", value: "Export Ready", icon: Globe },
                { label: "Payment Options", value: "L/C, T/T, Escrow", icon: Info }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary font-extrabold uppercase tracking-[2px] text-[11px]">
                    <item.icon size={14} /> {item.label}
                  </div>
                  <div className="text-[#111827] font-bold text-[18px]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* trust indicators */}
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: "Global Logistics", desc: "Door-to-door delivery across GCC, Africa, and Southeast Asia." },
            { icon: ShieldCheck, title: "Verified Hub", desc: "Every machine passes a rigorous 150-point technical check." },
            { icon: CheckCircle2, title: "Documentation", desc: "We handle all export paperwork and customs clearance." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2rem] border border-gray-100 bg-white hover:border-primary/20 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <item.icon size={28} />
              </div>
              <h3 className="text-[30px] font-extrabold leading-[1.2] text-[#111827] mb-3 tracking-tight">{item.title}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      <EnquiryModal 
        open={enquiryOpen} 
        onClose={() => setEnquiryOpen(false)} 
        productName={product.name} 
        product={product} 
      />
    </div>
  );
};

export default ProductDetail;
