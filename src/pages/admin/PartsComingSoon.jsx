import React, { useState, useEffect } from 'react';
import { Wrench, Mail, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const PartsComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 24 * 60 * 60); // 15 days in seconds
  const [email, setEmail] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const d = Math.floor(seconds / (24 * 3600));
    const h = Math.floor((seconds % (24 * 3600)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { d, h, m, s };
  };

  const { d, h, m, s } = formatTime(timeLeft);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email) {
      toast.success("Great! We'll notify you when the marketplace launches.");
      setEmail('');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
      <div className="relative mb-12">
        <div className="w-32 h-32 bg-amber-500/10 rounded-full flex items-center justify-center animate-pulse">
          <Wrench size={60} className="text-amber-500 animate-bounce" />
        </div>
        <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-800">
          V2.0
        </div>
      </div>

      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl lg:text-5xl font-display font-bold text-[#0F172A] mb-4 tracking-tight">
          Parts Marketplace <span className="text-amber-500">Launching Soon</span>
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          We are building a premium destination for genuine heavy machinery spare parts. 
          Get ready for a seamless global trading experience.
        </p>
      </div>

      {/* Countdown */}
      <div className="flex gap-4 md:gap-8 mb-16">
        {[
          { label: 'Days', value: d },
          { label: 'Hours', value: h },
          { label: 'Minutes', value: m },
          { label: 'Seconds', value: s }
        ].map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-2xl md:text-4xl font-display font-bold text-[#0F172A] mb-2">
              {String(unit.value).padStart(2, '0')}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{unit.label}</span>
          </div>
        ))}
      </div>

      {/* Notify Form */}
      <form onSubmit={handleNotify} className="w-full max-w-md relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
        <div className="relative flex bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="pl-4 flex items-center text-slate-400">
            <Mail size={18} />
          </div>
          <input 
            type="email" 
            placeholder="Enter your email for early access"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-4 text-sm focus:outline-none text-slate-700"
            required
          />
          <button 
            type="submit"
            className="bg-[#0F172A] hover:bg-slate-800 text-white px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all"
          >
            Notify Me
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartsComingSoon;
