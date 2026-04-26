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
  Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import productService from "@/services/productService";
import EnquiryModal from "@/components/EnquiryModal";
import AnimatedGear from "@/components/AnimatedGear";
import { useCurrency } from "@/context/CurrencyContext";
import CurrencyToggle from "@/components/CurrencyToggle";

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
        const data = await productService.getById(id);
        setProduct(data);
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
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const images = product?.images || [];
  const isSold = product?.availability === "sold";

  const nextImage = () => {
    setDirection(1);
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setDirection(-1);
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95
    })
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white font-display font-bold text-gray-400">Loading Technical Specs...</div>;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-display font-black text-heading mb-6 tracking-tight">Machine Not Found</h2>
          <Link to="/products" className="btn-cta inline-flex items-center gap-3 px-8 py-4 rounded-2xl">
            <ArrowLeft size={20} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const specifications = [
    { label: "Brand", value: product.brand },
    { label: "Model", value: product.model },
    { label: "Year", value: product.year },
    { label: "Category", value: product.category },
    { label: "Condition", value: product.condition || "Inspected" },
    { label: "Engine Hours", value: product.engine_hours || "N/A" }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] relative pt-32 pb-24">
      <div className="absolute top-[5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[150px] pointer-events-none" />

      <div className="container-section relative z-10">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
          <Link to="/products" className="flex items-center gap-3 text-heading/40 hover:text-primary transition-all font-black uppercase tracking-widest text-[11px] group">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
              <ArrowLeft size={18} />
            </div>
            Back to Products
          </Link>
          
          <div className="flex gap-4">
             <button onClick={handleShareLink} className="h-12 px-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary/30 hover:bg-primary/5 text-heading/60 hover:text-primary transition-all flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
               {isCopied ? <><CheckCircle2 size={16} className="text-green-500" /> Copied</> : <><Share2 size={16} /> Copy Link</>}
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[55%_1fr] gap-10 lg:gap-14">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={activeImage}
                  src={images[activeImage] || "https://images.unsplash.com/photo-1541888009187-54b38dcd2b31?auto=format&fit=crop&q=80&w=1200"}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: "tween", ease: "easeOut", duration: 0.15 }, opacity: { duration: 0.1 }, scale: { duration: 0.1 } }}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </AnimatePresence>

              {images.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 flex justify-between z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-xl flex items-center justify-center text-heading hover:bg-primary hover:text-white transition-all pointer-events-auto">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-xl flex items-center justify-center text-heading hover:bg-primary hover:text-white transition-all pointer-events-auto">
                    <ChevronRight size={24} />
                  </button>
                </div>
              )}
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 p-2 rounded-full bg-black/10 backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                {images.map((_, idx) => (
                  <button key={idx} onClick={() => { setDirection(idx > activeImage ? 1 : -1); setActiveImage(idx); }} className={`h-2 transition-all rounded-full ${activeImage === idx ? 'w-8 bg-primary' : 'w-2 bg-white/40 hover:bg-white'}`} />
                ))}
              </div>

              <div className="absolute top-8 left-8 z-20">
                <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-[1.25rem] flex items-center gap-3 shadow-xl border border-white/50">
                  <ShieldCheck className="text-primary" size={20} />
                  <span className="text-[11px] font-black text-heading uppercase tracking-[0.2em]">Verified Hub Inspection</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-4 gap-3 px-1">
              {images.map((img, idx) => (
                <button key={idx} onClick={() => { setDirection(idx > activeImage ? 1 : -1); setActiveImage(idx); }} className={`aspect-square rounded-[1.25rem] overflow-hidden border-2 transition-all duration-300 relative group ${activeImage === idx ? 'border-primary shadow-lg scale-105 z-10' : 'border-white bg-gray-50 opacity-100 hover:border-primary/30'}`}>
                  <img src={img} alt={`Thumbnail ${idx}`} className={`w-full h-full object-cover transition-all duration-500 ${activeImage === idx ? 'opacity-100' : 'opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
              <div className="flex items-center gap-3 mb-5">
                <span className="bg-primary text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em]">{product.category}</span>
                <span className="text-white/80 font-bold uppercase tracking-[0.12em] text-[10px] flex items-center gap-2 bg-gray-800 border border-gray-700 px-3.5 py-1.5 rounded-xl shadow-sm">
                  <Tag size={12} className="text-primary" /> Model: <span className="text-white font-black">{product.model}</span>
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-display font-black text-heading mb-3 leading-[1.1] tracking-tight">{product.name}</h1>

              <div className="bg-gray-50/60 rounded-2xl p-4 mb-5 border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-[0.04] rotate-12 pointer-events-none"><AnimatedGear size={120} /></div>
                <div className="flex items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="text-primary text-[9px] uppercase font-black tracking-[0.4em] mb-0.5 block">Global Export Price</span>
                    <h2 className={`text-4xl font-display tracking-tighter drop-shadow-sm whitespace-nowrap transition-all duration-300 ${isSold ? "text-[#9CA3AF] line-through font-medium" : "text-primary font-black"}`}>{product.price}</h2>
                  </div>
                  <div className="flex flex-col items-end pt-2">
                    <CurrencyToggle />
                    <span className="text-[11px] text-gray-400 font-bold mt-1.5 block">✦ Best Export Price</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {specifications.map((spec, i) => (
                  <div key={i} className="flex flex-col gap-1 bg-white border border-gray-100 rounded-xl px-3.5 py-3 shadow-sm hover:border-primary/20 hover:shadow-md transition-all duration-200 group">
                    <span className="text-gray-800 text-[9px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">{spec.label}</span>
                    <span className="text-gray-900 font-black text-[13px] tracking-tight">{spec.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => !isSold && setEnquiryOpen(true)}
                  disabled={isSold}
                  className={`w-full py-4 px-8 flex items-center justify-center gap-3 rounded-2xl font-black uppercase tracking-widest text-[13px] transition-all duration-300 ${isSold ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-1"}`}
                >
                  <MessageSquare size={20} /> {isSold ? "Sold Out" : "Enquire Now"}
                </button>
              </div>

              <a href="https://wa.me/918778868739" target="_blank" rel="noopener noreferrer" className={`mt-3 w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[12px] ${isSold ? "opacity-50 pointer-events-none" : "bg-[#25D366]/10 border border-[#25D366]/25 text-[#1a9e4d] hover:bg-[#25D366] hover:text-white"}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {isSold ? "WhatsApp Disabled" : "Chat on WhatsApp"}
              </a>

              <div className="mt-5 flex items-center gap-4 p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span></span>
                  <div className="flex -space-x-2">{[1,2,3].map(i => (<div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src={`https://i.pravatar.cc/150?img=${i+20}`} alt="Active Buyer" /></div>))}</div>
                </div>
                <p className="text-[12px] text-heading/70 font-bold leading-tight">🔥 <strong className="text-heading">18+ buyers</strong> currently interested in <strong className="text-primary">{product.category}</strong></p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {[
            { icon: Globe, title: "Global Logistics", desc: "Strategic international trading delivering excellence from Dubai to the world." },
            { icon: ShieldCheck, title: "Certified Units", desc: "Every unit undergoes a comprehensive 360° technical inspection." },
            { icon: CheckCircle2, title: "Export Ready", desc: "Complete documentation support for seamless international transit." }
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-[2rem] border border-gray-100 bg-white hover:border-primary/20 hover:shadow-lg transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors"><item.icon className="text-primary" size={26} /></div>
              <h3 className="text-xl font-display font-black text-heading mb-2 tracking-tight">{item.title}</h3>
              <p className="text-heading/40 text-[14px] font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} productName={product.name} product={product} />
    </div>
  );
};

export default ProductDetail;
