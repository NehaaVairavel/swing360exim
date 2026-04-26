import { Link, useLocation } from "react-router-dom";
import { Phone, Mail, MapPin, Linkedin, Facebook, Instagram, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedGear from "@/components/AnimatedGear";
import logo from "@/assets/logo.png";

const Footer = () => {
  const location = useLocation();

  const handleHomeClick = (e) => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#0a0e14] via-[#0d1219] to-[#04060a] text-white relative overflow-hidden font-body">
      
      {/* Background vignette (darker edges) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000a0_100%)] pointer-events-none z-0" />

      {/* Deep depth layers & textures */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
      
      {/* Very Subtle Gear Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <div className="grid grid-cols-5 gap-16 transform rotate-6 scale-150 mix-blend-screen">
          {[...Array(20)].map((_, i) => (
            <AnimatedGear key={i} size={150} className={i % 2 === 0 ? "animate-spin-slow" : "[animation-direction:reverse] animate-spin-slow"} />
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container-section py-12 md:py-14 relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-16">
          
          {/* LEFT: BRAND SECTION */}
          <div className="md:col-span-12 lg:col-span-5">
            <div className="flex items-center gap-4 mb-6 group cursor-default relative">
              <img 
                src={logo} 
                alt="Swing360 EXIM" 
                className="h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02] relative z-10" 
              />
              <div className="h-10 w-[1px] bg-white/20 mx-2 hidden sm:block relative z-10" />
              <div className="flex flex-col relative z-10">
                 <span className="font-display font-bold text-2xl tracking-wide text-[#EAEAEA] leading-none antialiased">Swing360</span>
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mt-1">Exim Trading</span>
              </div>
            </div>

            {/* Tagline Improvement */}
            <div className="relative pl-4 mb-8">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary rounded-full" />
              <p className="text-[#EAEAEA]/90 text-[14px] leading-relaxed max-w-sm font-normal antialiased">
                Global hub for heavy equipment trading. Delivering certified premium machinery with excellence from Dubai.
              </p>
            </div>
            
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[
                { Icon: Facebook, url: "#" },
                { Icon: Instagram, url: "#" },
                { Icon: Youtube, url: "#" },
                { Icon: Linkedin, url: "#" }
              ].map(({ Icon, url }, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#EAEAEA]/70 hover:text-primary hover:border-primary/50 hover:bg-primary/10 hover:-translate-y-1 transition-all duration-300 group">
                  <Icon size={17} strokeWidth={1.5} className="group-hover:brightness-110 transition-all duration-300" />
                </a>
              ))}
            </div>
          </div>

          {/* CENTER: NAVIGATION */}
          <div className="md:col-span-6 lg:col-span-3 lg:col-start-7">
            <h4 className="font-display font-bold text-[#EAEAEA] mb-7 text-[12px] uppercase tracking-[0.2em] antialiased">
              Quick Links
            </h4>
            <div className="flex flex-col gap-4">
              {[
                { label: "Home", path: "/" },
                { label: "Products", path: "/products" },
                { label: "Gallery", path: "/gallery" },
                { label: "Contact Us", path: "/contact-us" },
                { label: "Terms & Conditions", path: "/terms" },
                { label: "Privacy Policy", path: "/privacy-policy" },
              ].map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  onClick={l.path === "/" ? handleHomeClick : undefined}
                  className="relative text-[#EAEAEA]/80 text-[14px] font-medium transition-all duration-300 w-fit hover:translate-x-1 group antialiased hover:text-primary overflow-hidden pb-1"
                >
                  <span className="relative z-10">{l.label}</span>
                  {/* Subtle underline */}
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary group-hover:w-full transition-all duration-300 ease-out" />
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: CONTACT */}
          <div className="md:col-span-6 lg:col-span-3">
            <h4 className="font-display font-bold text-[#EAEAEA] mb-7 text-[12px] uppercase tracking-[0.2em] antialiased">
              Connect With Us
            </h4>
            <div className="flex flex-col">
              
              {/* Location */}
              <div className="flex items-start gap-4 group border-b border-white/5 pb-4 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all duration-300">
                  <MapPin size={16} className="text-primary transition-all duration-300" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-[10px] font-semibold text-[#EAEAEA]/60 uppercase tracking-[0.15em] mb-1">Our Location</span>
                  <span className="text-white text-[14px] font-medium antialiased group-hover:text-primary transition-colors duration-300">
                    Silicon Oasis, Dubai, UAE
                  </span>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-start gap-4 group border-b border-white/5 pb-4 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all duration-300">
                  <Phone size={16} className="text-primary transition-all duration-300" />
                </div>
                <div className="flex flex-col pt-0.5 gap-1.5">
                  <span className="text-[10px] font-semibold text-[#EAEAEA]/60 uppercase tracking-[0.15em]">Call Now</span>
                  <a href="tel:+971558599045" className="text-[#EAEAEA] text-[15px] font-black tracking-wide hover:text-primary transition-colors antialiased">
                    +971 55 859 9045
                  </a>
                  <a href="tel:+918778868739" className="text-[#EAEAEA] text-[15px] font-black tracking-wide hover:text-primary transition-colors antialiased">
                    +91 87788 68739
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 group">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all duration-300">
                  <Mail size={16} className="text-primary transition-all duration-300" />
                </div>
                <div className="flex flex-col pt-0.5">
                  <span className="text-[10px] font-semibold text-[#EAEAEA]/60 uppercase tracking-[0.15em] mb-1">Email Support</span>
                  <a href="mailto:swing360exim@gmail.com" className="text-[#EAEAEA] text-[14px] font-medium hover:text-primary transition-colors antialiased">
                    swing360exim@gmail.com
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Bottom Bar: Clean Divider & Minimal Text */}
        <div className="mt-14 pt-8 relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10" />
          
          <div className="text-[11px] text-[#EAEAEA]/70 font-medium uppercase tracking-[0.1em] antialiased hover:text-[#EAEAEA] transition-colors duration-300">
            © 2026 Swing360 Exim Trading
          </div>
          
          <div className="flex items-center gap-3 text-[11px] text-[#EAEAEA]/70 font-medium uppercase tracking-[0.1em] antialiased text-center hover:text-[#EAEAEA] transition-colors duration-300">
             <span>Dubai</span>
             <span className="text-primary/50 text-[14px] leading-none">•</span>
             <span>Strategic Hub</span>
             <span className="text-primary/50 text-[14px] leading-none">•</span>
             <span>Global Export Network</span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
