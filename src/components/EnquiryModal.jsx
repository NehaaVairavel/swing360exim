import { useState, useEffect, useRef } from "react";
import { X, User, Phone, Mail, MapPin, ArrowRight, ShieldCheck, Tag, Calendar, ChevronDown, Check, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import enquiryService from "@/services/enquiryService";
import { toast } from "sonner";

const COUNTRIES = [
  { name: "Afghanistan", flag: "🇦🇫" },
  { name: "Albania", flag: "🇦🇱" },
  { name: "Algeria", flag: "🇩🇿" },
  { name: "Angola", flag: "🇦🇴" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Bahrain", flag: "🇧🇭" },
  { name: "Bangladesh", flag: "🇧🇩" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "Chile", flag: "🇨🇱" },
  { name: "China", flag: "🇨🇳" },
  { name: "Colombia", flag: "🇨🇴" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "France", flag: "🇫🇷" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Greece", flag: "🇬🇷" },
  { name: "India", flag: "🇮🇳" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Iraq", flag: "🇮🇶" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "Jordan", flag: "🇯🇴" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "Kuwait", flag: "🇰🇼" },
  { name: "Malaysia", flag: "🇲🇾" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Oman", flag: "🇴🇲" },
  { name: "Pakistan", flag: "🇵🇰" },
  { name: "Philippines", flag: "🇵🇭" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Qatar", flag: "🇶🇦" },
  { name: "Russia", flag: "🇷🇺" },
  { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Turkey", flag: "🇹🇷" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Vietnam", flag: "🇻🇳" },
];

const STATES_BY_COUNTRY = {
  "India": ["Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal", "Other"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Other"],
};

const CountrySelect = ({ value, onChange, required }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const selected = COUNTRIES.find(c => c.name === value);
  const filtered = query ? COUNTRIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())) : COUNTRIES;

  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (country) => {
    onChange(country.name);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setOpen(true)} className={`w-full pl-11 pr-10 py-3.5 bg-gray-50 border rounded-xl text-[14px] text-left font-medium transition-all ${open ? "border-primary ring-2 ring-primary/15 bg-white" : "border-gray-200"} ${!value ? "text-gray-400" : "text-gray-900"}`}>
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><MapPin size={15} /></span>
        <span className="truncate">{selected ? `${selected.flag} ${selected.name}` : "Select your country"}</span>
        <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type to search..." className="w-full px-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none" />
            </div>
            <ul className="max-h-[180px] overflow-y-auto py-1">
              {filtered.map((c) => (
                <li key={c.name} onClick={() => handleSelect(c)} className="flex items-center gap-3 px-4 py-3 text-[13px] cursor-pointer hover:bg-orange-50 text-gray-700">
                  <span>{c.flag}</span><span className="flex-1">{c.name}</span>
                  {value === c.name && <Check size={13} className="text-primary" />}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EnquiryModal = ({ open, onClose, productName, product }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", country: "", state: "", city: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        interested_product: productName || "General",
        budget: "Contact for Quote",
        message: `Inquiry for product: ${productName} (Model: ${product?.model || "N/A"})\nLocation: ${form.city}, ${form.state}, ${form.country}\n\nClient Message: ${form.message || "I am interested in this machine."}`
      };
      await enquiryService.submit(payload);
      setSubmitted(true);
      toast.success("Enquiry submitted to Dubai Hub!");
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", phone: "", email: "", country: "", state: "", city: "", message: "" });
        onClose();
      }, 3000);
    } catch (error) {
      toast.error("Failed to send enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-all font-medium";

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 16 }} className="relative w-full max-w-[860px] bg-white rounded-[1.75rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] overflow-y-auto md:overflow-visible" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 font-bold uppercase tracking-wider transition-all"><ArrowLeft size={13} /><span className="hidden sm:inline">Back</span></button>
            <button onClick={onClose} className="absolute top-3.5 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-primary/20 text-white/80 transition-all"><X size={17} /></button>

            <div className="relative md:w-[42%] shrink-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex flex-col p-7 gap-5">
              <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 85% 15%, #f59e0b 0%, transparent 50%)" }} />
              <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-lg shrink-0 mt-10">
                <img src={product?.images?.[0] || "https://images.unsplash.com/photo-1541888009187-54b38dcd2b31?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="inline-flex items-center gap-1.5 bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit"><ShieldCheck size={10} />Verified Listing</div>
                <h3 className="text-white font-black text-[1.1rem] leading-snug tracking-tight">{productName || "Heavy Equipment"}</h3>
                <div className="space-y-2 pt-1 border-t border-white/10">
                  <div className="flex items-center gap-2 text-[13px]"><Tag size={12} className="text-primary" /><span className="text-white/55 w-10">Price</span><span className="text-white font-black">{product?.price || "POA"}</span></div>
                  <div className="flex items-center gap-2 text-[13px]"><Calendar size={12} className="text-primary" /><span className="text-white/55 w-10">Year</span><span className="text-white font-bold">{product?.year || "N/A"}</span></div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-7 md:p-9 flex flex-col justify-center">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5"><span className="text-emerald-600 text-4xl">✓</span></div>
                  <p className="text-2xl text-gray-900 font-display font-black mb-2">Request Sent!</p>
                  <p className="text-gray-500 font-medium text-[15px] max-w-[260px] mx-auto">Our team will contact you from the Dubai office shortly.</p>
                </motion.div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="font-display font-black text-[1.5rem] text-gray-900 tracking-tight mb-1">Get Details & Best Price</h2>
                    <p className="text-gray-400 text-[13px] font-medium">Fill in your details and we'll get back to you instantly.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={15} /></span><input required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></div>
                    <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Phone size={15} /></span><input required type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></div>
                    <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={15} /></span><input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></div>
                    <CountrySelect value={form.country} required onChange={(country) => setForm({ ...form, country })} />
                    <div className="grid grid-cols-2 gap-3">
                      <input required placeholder="State *" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls.replace('pl-11', 'pl-4')} />
                      <input required placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls.replace('pl-11', 'pl-4')} />
                    </div>
                    <motion.button disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className={`w-full bg-primary text-white font-black py-4 rounded-xl text-[14px] uppercase tracking-[0.12em] transition-all shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                      {loading ? "Sending..." : "Send Enquiry"}
                    </motion.button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnquiryModal;
