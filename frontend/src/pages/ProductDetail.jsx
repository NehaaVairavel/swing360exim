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
  Info,
  Truck,
  FileText,
  Lock,
  Check
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
  const priceStr = cleanPrice(product?.price || "0");
  const numericValue = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  const displayPrice = formatPrice(numericValue);

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
    <div className="min-h-fit bg-[#FDFDFD] relative pt-[84px] pb-4 font-jakarta max-w-[1500px] mx-auto">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
      <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-accent/[0.04] blur-[100px] pointer-events-none" />

      <div className="container-section relative z-10 mt-8">
        {/* Breadcrumbs & Actions */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
          <Link to="/products" className="flex items-center gap-3 text-slate-400 hover:text-primary transition-all font-medium uppercase tracking-wider text-[12px] group">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
              <ArrowLeft size={16} />
            </div>
            Back to Global Inventory
          </Link>
          
          <div className="flex gap-3">
             <button onClick={handleShareLink} className="h-11 px-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 hover:bg-primary/5 text-heading/60 hover:text-primary transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
               {isCopied ? <><CheckCircle2 size={16} className="text-green-500" /> Copied</> : <><Share2 size={16} /> Share Machine</>}
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[55%_45%] gap-12 items-start h-auto">
          {/* Left Column: Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="relative h-[420px] !important rounded-[22px] overflow-hidden bg-white border border-gray-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] group"
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
                {isSold && (
                  <div className="bg-rose-500 text-white px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-xl font-black uppercase tracking-[0.2em] text-[11px]">
                    Sold Out
                  </div>
                )}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-[10px] mt-[10px]">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => { setDirection(idx > activeImage ? 1 : -1); setActiveImage(idx); }} 
                  className={`aspect-[4/3] h-[70px] rounded-[12px] overflow-hidden border-2 transition-all duration-300 relative group ${activeImage === idx ? 'border-primary shadow-lg scale-105 z-10' : 'border-white bg-gray-50 opacity-60 hover:opacity-100 hover:border-primary/30'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Info & CTAs */}
          <div className="flex flex-col">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary/10 text-primary px-[14px] py-[8px] rounded-full text-[10px] font-bold uppercase tracking-[2px]">{product.category}</span>
                <span className="bg-[#0F172A] text-white px-[12px] py-[6px] rounded-full text-[9px] font-black uppercase tracking-[1.5px] flex items-center gap-2">
                   REF: {refNumber}
                </span>
              </div>

              <h1 className="text-[28px] lg:text-[42px] font-extrabold text-[#0F172A] mb-2 leading-none tracking-[-1.5px] uppercase">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4 text-[#6B7280] font-bold text-[12px] uppercase tracking-wide">
                <div className="flex items-center gap-1.5">
                   <MapPin size={14} className="text-[#6B7280]" /> {product.location || "India"}
                </div>
              </div>


              


              <div className="bg-white border border-slate-200 rounded-[20px] p-4 lg:p-5 shadow-sm mb-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12 pointer-events-none group-hover:rotate-45 transition-transform duration-1000">
                  <AnimatedGear size={100} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#F59E0B] text-[9px] uppercase font-black tracking-[2px]">Premium Export Price</span>
                    <CurrencyToggle />
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <h2 className={`text-[32px] lg:text-[42px] font-black tracking-[-1.5px] leading-none transition-all duration-300 ${isSold ? "text-gray-300 line-through" : "text-[#F59E0B]"}`}>
                      {displayPrice}
                    </h2>
                    <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Ex-Works Dubai</span>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    {[
                      { icon: CheckCircle2, text: "Negotiable on Bulk Orders", color: "text-emerald-500" },
                      { icon: Truck, text: "Ready for Immediate Dispatch", color: "text-blue-500" },
                      { icon: Clock, text: "Response in 10 mins", color: "text-amber-500" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-[#0F172A]/70 uppercase tracking-wide">
                        <item.icon size={13} className={item.color} />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {specifications.map((spec, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-[18px] p-3.5 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                      <spec.icon size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-[1.5px] text-slate-400 mb-0.5">{spec.label}</span>
                      <span className="text-[14px] font-extrabold text-[#0F172A] leading-none truncate">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => !isSold && setEnquiryOpen(true)}
                    disabled={isSold}
                    className={`h-[42px] px-4 flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all duration-300 ${isSold ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#f5a000] text-white shadow-lg shadow-[#f5a000]/20 hover:-translate-y-0.5 hover:shadow-xl"}`}
                  >
                    <MessageSquare size={14} className="shrink-0" /> {isSold ? "Machine Sold" : "Enquire Now"}
                  </button>
                  
                  <a 
                    href={`https://wa.me/918778868739?text=Hi, I am interested in ${product.name} (Ref: ${refNumber})`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`h-[42px] px-4 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 font-bold uppercase tracking-wider text-[11px] ${isSold ? "opacity-50 pointer-events-none" : "bg-[#eaf9ef] text-[#1fa855] border border-[#cdeed7] hover:bg-[#1fa855] hover:text-white"}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
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
          className="mt-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[24px] lg:text-[32px] font-black text-[#0F172A] tracking-tight leading-none uppercase">Technical Description</h2>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 lg:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
              {/* Left Column: Machine Details */}
              <div className="space-y-8">
                <h3 className="text-[18px] font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings size={18} className="text-primary" />
                  </div>
                  Machine Details
                </h3>
                <div className="grid grid-cols-1 gap-5">
                  {[
                    { label: "Brand", value: product.brand },
                    { label: "Model", value: `${product.model} / ${product.year}` },
                    { label: "Hours", value: product.engine_hours || "N/A" },
                    { label: "Location", value: product.location || "India" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-4">
                      <span className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.15em]">{item.label}</span>
                      <span className="text-[#0F172A] font-extrabold text-[16px]">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-slate-500 font-medium leading-relaxed text-[15px] whitespace-pre-line pt-2">
                  {product.full_description || product.short_description || "Detailed technical specifications for this machine are available upon request. Our team has thoroughly inspected this unit to ensure it meets global export standards."}
                </p>
              </div>

              {/* Right Column: Export Support */}
              <div className="space-y-8">
                <h3 className="text-[18px] font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe size={18} className="text-primary" />
                  </div>
                  Export Support
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { icon: Truck, title: "Worldwide Shipping" },
                    { icon: ShieldCheck, title: "Inspection Passed" },
                    { icon: FileText, title: "Documentation Support" },
                    { icon: Lock, title: "Secure Payment" },
                    { icon: Clock, title: "Fast Dispatch" },
                    { icon: Globe, title: "Dubai HQ Assistance" }
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-4 group cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                        <benefit.icon size={18} className="text-primary" />
                      </div>
                      <span className="text-[#0F172A] font-bold text-[14px] leading-tight">{benefit.title}</span>
                    </div>
                  ))}
                </div>
                
                {/* Visual Accent */}
                <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                     <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-[#0F172A] font-black uppercase text-[12px] tracking-wider mb-0.5">Swing360 Verified</h4>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-tight">Technical Hub Certification Passed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* trust indicators */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: "Global Logistics", desc: "Door-to-door delivery across GCC, Africa, and Southeast Asia." },
            { icon: ShieldCheck, title: "Verified Hub", desc: "Every machine passes a rigorous 150-point technical check." },
            { icon: CheckCircle2, title: "Documentation", desc: "We handle all export paperwork and customs clearance." }
          ].map((item, i) => (
            <div key={i} className="p-7 rounded-[24px] border border-gray-100 bg-white hover:border-primary/20 hover:shadow-xl transition-all group min-h-[220px]">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <item.icon size={28} />
              </div>
              <h3 className="text-[24px] font-extrabold text-heading mb-3 tracking-tight">{item.title}</h3>
              <p className="text-gray-400 text-[15px] font-medium leading-[1.6]">{item.desc}</p>
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

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] flex gap-3">
        <a 
          href={`https://wa.me/918778868739?text=Hi, I am interested in ${product.name}`} 
          className="flex-1 h-12 bg-[#1fa855] text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[11px] tracking-wider"
        >
          <Phone size={16} /> WhatsApp
        </a>
        <button 
          onClick={() => !isSold && setEnquiryOpen(true)}
          className="flex-1 h-12 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[11px] tracking-wider shadow-lg shadow-primary/20"
        >
          <MessageSquare size={16} /> Enquire
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
