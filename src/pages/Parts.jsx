import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Parts = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 15, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    // Set launch date to 15 days from now
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 15);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-body relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-slate-900/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="pt-32 pb-20 container-section relative z-10 flex flex-col items-center text-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full mb-6"
        >
          <span className="text-amber-600 font-extrabold text-[11px] uppercase tracking-[0.2em]">Launching Soon</span>
        </motion.div>

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-[46px] font-display font-extrabold text-slate-900 mb-4 tracking-[-0.02em] leading-[1.1]"
        >
          Genuine Parts & Accessories
        </motion.h1>

        {/* Subtext */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[17px] text-slate-500 font-medium max-w-[760px] leading-[1.7] mb-12"
        >
          High-quality OEM and replacement parts engineered for durability and peak machine performance. Our digital parts store is currently under construction.
        </motion.p>

        {/* Timer Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-900 to-[#111827] text-white p-8 md:px-12 md:py-10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.18)] flex flex-col items-center mb-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <span className="text-slate-400 font-bold text-[13px] uppercase tracking-widest mb-6 relative z-10">Parts Store Launching In</span>
          
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Mins", value: timeLeft.mins },
              { label: "Secs", value: timeLeft.secs }
            ].map((block, i) => (
              <motion.div 
                key={block.label}
                animate={{ y: [0, -4, 0], opacity: [1, 0.92, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                className="bg-white/10 backdrop-blur-md rounded-[16px] min-w-[80px] p-4 flex flex-col items-center border border-white/10"
              >
                <span className="text-3xl md:text-4xl font-display font-black text-white">{String(block.value).padStart(2, '0')}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{block.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="h-[52px] px-8 bg-amber-500 text-white rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group">
            <Bell size={18} className="group-hover:animate-bounce" /> Notify Me
          </button>
          <Link to="/products" className="h-[52px] px-8 bg-white text-slate-900 border border-slate-200 rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 group">
            Browse Machinery <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default Parts;
