import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, useInView, useScroll } from "framer-motion";
import { Truck, Wrench, Banknote, Headphones, Globe, ArrowRight, Shield, Award, Search } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AnimatedGear from "@/components/AnimatedGear";
import SectionReveal from "@/components/SectionReveal";
import BrandCarousel from "@/components/BrandCarousel";
import productService from "@/services/productService";
import settingsService from "@/services/settingsService";
import { socket } from "@/socket";
import heroBg from "@/assets/hero-bg.jpg";
import excavatorImg from "@/assets/category/excavator.jpg";
import backhoeImg from "@/assets/category/backhoe.jpg";
import dozerImg from "@/assets/category/dozer.jpg";
import wheelLoaderImg from "@/assets/category/wheel-loader.jpg";
import graderImg from "@/assets/category/grader.jpg";
import rollerImg from "@/assets/category/roller.jpg";
import skidSteerImg from "@/assets/category/skid-steer.jpg";
import bucketsImg from "@/assets/category/buckets.jpg";
import materialHandlerImg from "@/assets/category/material-handler.jpg";
import othersImg from "@/assets/category/others.jpg";
import uaeFlag from "@/assets/flags/uae.png";

const stats = [
  { value: 10, suffix: "+", label: "Years Operating", icon: Shield },
  { value: 200, suffix: "+", label: "Units Delivered", icon: Truck },
  { value: 120, suffix: "+", label: "Machines Exported", icon: Award },
  { value: 6, suffix: "", label: "Countries Served", icon: Globe },
];

const categoriesData = [
  { name: "Excavators", image: excavatorImg },
  { name: "Backhoe Loaders", image: backhoeImg },
  { name: "Dozers", image: dozerImg },
  { name: "Wheel Loaders", image: wheelLoaderImg },
  { name: "Graders", image: graderImg },
  { name: "Rollers", image: rollerImg },
  { name: "Skid Steer", image: skidSteerImg },
  { name: "Buckets", image: bucketsImg },
  { name: "Material Handlers", image: materialHandlerImg },
  { name: "Others", image: othersImg },
];

const markets = [
  { name: "UAE", code: "ae" },
  { name: "Middle East", code: "sa" },
  { name: "Africa", code: "za" },
  { name: "Europe", code: "eu" },
  { name: "India", code: "in" },
  { name: "North America", code: "us" },
];

const useCountUp = (target, duration = 2500) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return { count, ref };
};

const StatCard = ({ stat, i }) => {
  const { count, ref } = useCountUp(stat.value);
  const IconComp = stat.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.12 }}
      className="text-center card-premium rounded-3xl p-6 md:p-8 border-accent-left group"
    >
      <div className="icon-container w-16 h-16 rounded-2xl mx-auto mb-5 relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <IconComp size={28} className="text-primary group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 relative z-10" />
      </div>
      <div className="text-4xl md:text-5xl font-display font-black text-shimmer tracking-tight">
        {count}{stat.suffix}
      </div>
      <div className="text-[15px] text-muted-foreground mt-2 font-medium">{stat.label}</div>
    </motion.div>
  );
};

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5 } 
  }
};

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: allProducts = [], refetch: refetchAll } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
    refetchInterval: realtimeConnected ? false : 1000,
  });

  const { data: featuredProducts = [], refetch: refetchFeatured } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: () => productService.getAll({ featured: true }).then(data => data.slice(0, 4)),
    refetchInterval: realtimeConnected ? false : 1000,
  });

  useEffect(() => {
    socket.on("products_updated", () => {
      console.log("Real-time home update received...");
      refetchAll();
      refetchFeatured();
    });
    return () => socket.off("products_updated");
  }, [refetchAll, refetchFeatured]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth - 0.5);
    mouseY.set(clientY / innerHeight - 0.5);
  };

  const heroImageX = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  const heroImageY = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);
  const gearRotation = useTransform(mouseX, [-0.5, 0.5], [-30, 30]);

  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const shapeY1 = useTransform(scrollY, [0, 1000], [0, 100]);
  const shapeY2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const gearY = useTransform(scrollY, [0, 1000], [0, 300]);

  const heroTitle = siteSettings?.hero_text || "Premium Heavy Equipment Trading from Dubai";

  return (
    <div className="overflow-hidden" onMouseMove={handleMouseMove}>
      <section ref={heroRef} className="relative min-h-[78vh] flex items-center section-base industrial-pattern overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-[0.06] scale-110 blur-[1px]" />
        </motion.div>

        <motion.div style={{ y: shapeY1, x: 100 }} className="absolute top-[15%] right-[5%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <motion.div style={{ y: shapeY2, x: -100 }} className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-accent/[0.05] rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div style={{ y: gearY, rotate: gearRotation }} className="absolute -right-24 top-24 opacity-[0.03] pointer-events-none hidden lg:block">
          <AnimatedGear size={600} />
        </motion.div>

        <div className="container-section relative z-10 pt-[72px] pb-10 md:pt-[80px] md:pb-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="hidden lg:block absolute top-[80px] right-8 z-30 w-[360px]">
            <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md rounded-full p-1.5 shadow-premium flex items-center gap-2 border border-white/60 focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-300">
              <div className="flex-1 flex items-center gap-3 px-5">
                <Search size={18} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search Excavators, CAT 320..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[13px] text-heading placeholder:text-muted-foreground w-full font-semibold"
                />
              </div>
              <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary-dark transition-all shadow-xl shadow-primary/25 font-black uppercase tracking-widest text-[12px]">
                Search
              </button>
            </form>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="max-w-[560px]">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-md border border-primary/20 text-heading px-4 py-1.5 rounded-full text-[9px] font-display font-black uppercase tracking-[0.2em] mb-5 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Global Machinery Export Hub
              </motion.div>

              <div className="text-4xl md:text-5xl lg:text-[72px] font-display font-black text-heading leading-[1.05] mb-5 text-shadow-lg drop-shadow-sm">
                {heroTitle.split(" ").map((word, i) => (
                  <motion.span key={i} custom={i} initial="hidden" animate="visible" variants={wordVariants} className={`inline-block mr-3 lg:mr-4 ${word === "Dubai" ? "text-shimmer relative" : ""}`}>
                    {word}
                    {word === "Dubai" && <span className="absolute inset-0 bg-primary/20 blur-2xl -z-10 rounded-full scale-150"></span>}
                  </motion.span>
                ))}
              </div>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }} className="text-base md:text-[17px] mb-6 text-heading/65 leading-[1.6] font-semibold max-w-[520px]">
                Reliable Machinery • Transparent Trade • Worldwide Logistics
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className="flex flex-wrap gap-4">
                <Link to="/products" className="group btn-cta px-8 py-3.5 rounded-xl font-display font-black flex items-center gap-2 text-[15px] shadow-glow shadow-primary/20">
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Products
                    <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </Link>

                <div className="lg:hidden w-full mt-6">
                  <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md rounded-full p-1 shadow-premium flex items-center gap-2 border border-border/40 focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-300">
                    <div className="flex-1 flex items-center gap-2.5 px-4">
                      <Search size={16} className="text-muted-foreground" />
                      <input
                        type="search"
                        placeholder="Search Machinery..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-[13px] text-heading placeholder:text-muted-foreground w-full font-medium py-2.5"
                      />
                    </div>
                    <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                      Search
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 50 }} style={{ x: heroImageX, y: heroImageY }} className="hidden lg:block relative lg:pt-20 lg:pl-10">
              <div className="relative animate-float-hero hero-image-wrapper max-w-[500px] ml-auto">
                <div className="w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden shadow-hero-image border-[1.5px] border-white/50 relative z-10 bg-white">
                  <img src={excavatorImg} alt="Heavy Equipment" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-[40px] -z-10 animate-glow-breathe" />
                <div className="absolute -inset-2 rounded-[1.5rem] bg-white/60 blur-[15px] -z-10" />

                <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} className="absolute -bottom-6 -left-6 glass-card rounded-xl px-5 py-4 z-20 shadow-premium border-accent-left">
                  <div className="text-2xl font-display font-black text-primary drop-shadow-sm">200+</div>
                  <div className="text-[11px] text-heading/70 font-bold uppercase tracking-wide mt-1">Units Delivered</div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, scale: 0.8, x: -20 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 1.4, duration: 0.6 }} className="absolute -top-6 -right-6 glass-card rounded-xl px-5 py-4 z-20 shadow-premium">
                  <div className="text-2xl font-display font-black text-primary drop-shadow-sm">Global</div>
                  <div className="text-[11px] text-heading/70 font-bold uppercase tracking-wide mt-1">Export Network</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-warm industrial-dots py-10 md:py-12 section-divider-top overflow-hidden">
        <div className="container-section relative z-10">
          <SectionReveal className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-display font-black text-heading mb-3 heading-decorated tracking-tight">
              Our Global <span className="text-gradient drop-shadow-sm">Presence</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-[520px] mx-auto mt-2 font-semibold">Delivering excellence in heavy equipment trading across global markets</p>
          </SectionReveal>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s, i) => <StatCard key={i} stat={s} i={i} />)}
          </div>
        </div>
      </section>

      <section className="section-tinted py-10 md:py-12 section-divider-top relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="container-section relative z-10">
          <SectionReveal className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-display font-black text-heading mb-3 heading-decorated tracking-tight">
              Premium <span className="text-gradient drop-shadow-sm">Categories</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-[520px] mx-auto mt-2 font-semibold">Explore our diverse range of high-quality heavy equipment ready for global export</p>
          </SectionReveal>
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categoriesData.map((cat) => {
              const count = allProducts.filter(p => p.category === cat.name).length;
              return (
                <motion.div key={cat.name} variants={staggerItem}>
                  <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="group relative overflow-hidden rounded-[1.5rem] aspect-[4/3] block card-premium shadow-premium">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-[1.05] group-hover:brightness-110 group-hover:contrast-[1.05]" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/90 z-10" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                      <h3 className="font-display font-extrabold text-xl text-white drop-shadow-md transform transition-transform duration-500 group-hover:translate-y-[-4px]">{cat.name}</h3>
                      <div className="flex items-center gap-2 mt-2 overflow-hidden">
                        <div className="h-[2px] w-0 bg-primary group-hover:w-8 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <span className="text-white/0 group-hover:text-white/90 text-[10px] font-black uppercase tracking-wider transition-all duration-500 translate-x-[-15px] group-hover:translate-x-0">View Products</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 z-30">
                      <div className="bg-primary/95 backdrop-blur-md text-white px-3 py-1 rounded-full text-[12px] font-black shadow-lg shadow-primary/30 flex items-center justify-center min-w-[32px] border border-white/20">
                        {count}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
          
          <div className="mt-12 text-center">
            <Link to="/products" className="btn-secondary-glass inline-flex items-center gap-2">
              Browse All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <BrandCarousel />

      <section className="section-base py-10 md:py-12 section-divider-top relative overflow-hidden">
        <motion.div style={{ y: shapeY1 }} className="absolute top-[20%] right-[10%] opacity-[0.03] text-primary">
          <Globe size={400} />
        </motion.div>
        
        <div className="container-section text-center relative z-10">
          <SectionReveal>
            <h2 className="text-3xl md:text-4xl font-display font-black text-heading mb-3 heading-decorated tracking-tight flex items-center justify-center gap-3">
              <Globe className="text-primary drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]" size={32} />
              Markets We <span className="text-gradient drop-shadow-sm">Serve</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-[520px] mx-auto mb-8 mt-2 font-semibold">Strategic location in Dubai enabling seamless delivery to global markets</p>
          </SectionReveal>
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 max-w-6xl mx-auto">
            {markets.map((m) => (
              <motion.div key={m.name} variants={staggerItem} whileHover={{ y: -6 }} className="group bg-white/90 backdrop-blur-md border border-border/50 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:shadow-premium hover:border-primary/50 shadow-sm relative overflow-hidden cursor-default">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md transition-transform duration-500 group-hover:scale-110 relative z-10 bg-white">
                  <img src={m.name === "UAE" ? uaeFlag : `https://flagcdn.com/w80/${m.code}.png`} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-display font-extrabold text-heading text-[15px] tracking-tight relative z-10">{m.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="gradient-cta py-10 md:py-12 relative overflow-hidden">
        <div className="container-section text-center relative z-20">
          <SectionReveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white mb-4 drop-shadow-lg tracking-tight">Ready to Upgrade Your Fleet?</h2>
            <p className="text-white/90 mb-6 max-w-[520px] mx-auto text-base md:text-[17px] font-semibold drop-shadow-md">Get competitive pricing, global shipping logistics, and expert consultation from our Dubai headquarters.</p>
            <div className="flex flex-col items-center justify-center gap-3">
              <a href={`https://wa.me/${siteSettings?.whatsapp || "971558599045"}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 bg-white text-primary px-8 py-3.5 rounded-xl font-display font-black text-[15px] hover:scale-[1.03] hover:brightness-105 shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-400 group relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">Start Your Enquiry <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" /></span>
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              </a>
              <p className="text-white/80 text-[13px] font-semibold tracking-wide mt-1 text-center">Get instant response from our team</p>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
};

export default Index;
