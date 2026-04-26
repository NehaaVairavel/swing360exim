import { useState, useEffect } from "react";
import publicService from "@/services/publicService";
import enquiryService from "@/services/enquiryService";
import { 
  CheckCircle, 
  Mail, 
  TrendingUp, 
  TrendingDown,
  Globe, 
  Plus,
  ArrowRight,
  ExternalLink,
  Box
} from "lucide-react";
import { Link } from "react-router-dom";

const CountUp = ({ end, duration = 1500, prefix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{prefix}{count.toLocaleString()}</>;
};

const WelcomeBanner = () => (
  <div className="relative overflow-hidden hero-banner-premium p-8 lg:p-10 mb-6 group shadow-2xl shadow-[#030814]/20">
    <div className="absolute top-0 right-0 w-[60%] h-full opacity-40 pointer-events-none transition-transform duration-1000 group-hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-l from-[#030814] via-transparent to-transparent z-10" />
      <img 
        src="https://images.unsplash.com/photo-1541888009187-54b38dcd2b31?auto=format&fit=crop&q=80&w=1200" 
        alt="Machinery" 
        className="w-full h-full object-cover mix-blend-luminosity brightness-75"
      />
      {/* Abstract World Map Overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay animate-pulse-subtle bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-repeat shadow-inner" />
    </div>
    
    <div className="relative z-20 max-w-2xl">
      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em] mb-6 animate-in slide-in-from-left duration-700">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
        <Globe size={12} />
        <span>Global Network Sync Active</span>
      </div>
      <h1 className="text-4xl lg:text-5xl font-display font-black text-white mb-4 tracking-tight leading-[1.1]">
        Swing360 <span className="text-amber-500">Global Command</span>
      </h1>
      <p className="text-slate-400 text-base mb-8 leading-relaxed font-semibold max-w-xl">
        Streamline your heavy equipment ecosystem. Control inventory, track global enquiries, and optimize your Dubai-based export hub.
      </p>
      
      <div className="flex flex-wrap gap-4">
        <Link to="/admin/add-product" className="px-6 py-2.5 btn-orange-glow rounded-xl font-black text-[13px] flex items-center gap-2.5 group/btn">
          <Plus size={18} className="transition-transform group-hover/btn:rotate-90 duration-500" />
          <span>Post New Machinery</span>
          <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-2 duration-500" />
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[13px] transition-all backdrop-blur-xl flex items-center gap-2.5 border border-white/10 hover:border-white/30">
          <ExternalLink size={18} />
          <span>Public Portal</span>
        </a>
      </div>
    </div>
    
    {/* Decorative Elements */}
    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
  </div>
);

const KpiCard = ({ title, value, icon: Icon, trend, trendUp, prefix = "", color = "amber" }) => (
  <div className="card-premium p-5 group">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#030814] group-hover:bg-amber-500 group-hover:text-white group-hover:rotate-6 transition-all duration-700 shadow-sm border border-slate-100 group-hover:border-amber-400 group-hover:shadow-lg group-hover:shadow-amber-500/20`}>
        <Icon size={22} />
      </div>
      <div className="flex flex-col items-end">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trend}</span>
        </div>
        {/* Mock Sparkline */}
        <div className="h-8 w-20 mt-3 opacity-30 group-hover:opacity-100 transition-opacity duration-700">
           <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path 
                d={trendUp ? "M0,25 Q25,5 50,20 T100,5" : "M0,5 Q25,25 50,10 T100,25"} 
                fill="none" 
                stroke={trendUp ? "#10b981" : "#f43f5e"} 
                strokeWidth="3" 
                strokeLinecap="round"
                className="animate-pulse"
              />
           </svg>
        </div>
      </div>
    </div>
    <div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
      <div className="flex items-end gap-1.5">
        <h3 className="text-3xl font-display font-black text-[#030814] tracking-tighter">
          <CountUp end={value} prefix={prefix} />
        </h3>
        <span className="text-[10px] font-extrabold text-slate-400 mb-1.5 italic">Live</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    available_products: 0,
    sold_products: 0,
    enquiries_count: 0,
  });
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, enquiriesData] = await Promise.all([
          publicService.getDashboardStats(),
          enquiryService.getAll()
        ]);
        setStats(statsData || {});
        setEnquiries(Array.isArray(enquiriesData) ? enquiriesData.slice(0, 5) : []);
      } catch (error) {
        console.error("Dashboard fetch error:", error?.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500 font-extrabold">Initializing Command Center...</div>;

  return (
    <div className="animate-in fade-in duration-700">
      <WelcomeBanner />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <KpiCard title="Total Inventory" value={stats.total_products} icon={Box} trend="+12" trendUp={true} />
        <KpiCard title="Active Listings" value={stats.available_products} icon={Globe} trend="+5" trendUp={true} />
        <KpiCard title="Sold Units" value={stats.sold_products} icon={CheckCircle} trend="+8" trendUp={true} />
        <KpiCard title="Total Leads" value={stats.enquiries_count} icon={Mail} trend="+15" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="p-6 lg:p-7 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-display font-black text-[#030814] tracking-tight">Global Inquiries</h2>
                <p className="text-slate-400 text-[13px] font-semibold mt-0.5">Live feed of active machinery export requests</p>
            </div>
            <Link to="/admin/enquiries" className="px-5 py-2 bg-slate-50 text-slate-900 font-extrabold text-[13px] hover:bg-slate-900 hover:text-white rounded-lg transition-all duration-500 shadow-sm border border-slate-200">View Full Log</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Client / Origin</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Machinery Requested</th>
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-extrabold text-slate-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                          {q.name?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#030814] text-sm">{q.name}</div>
                          <div className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider mt-0.5">{q.country || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><Box size={14} /></div>
                         <div className="text-[13px] font-extrabold text-slate-700">{q.interested_product || "Fleet Inquiry"}</div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          q.status === 'new' 
                            ? 'bg-amber-50 text-amber-600 border-amber-200/50' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
                        }`}>
                          {q.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
             <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Data Synced: Just Now</span>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white rounded-3xl p-7 lg:p-8 border border-slate-200/60 shadow-xl shadow-slate-200/40 flex flex-col h-full animate-in fade-in slide-in-from-right-6 duration-1000">
             <h2 className="text-xl font-display font-black text-[#030814] mb-1 tracking-tight">Market Demand</h2>
             <p className="text-slate-400 text-[13px] font-semibold mb-6 italic">Hot categories globally</p>
             <div className="space-y-6 flex-1">
                {[
                    { name: 'Excavators', count: 45, color: "from-amber-400 to-orange-500" },
                    { name: 'Dozers', count: 25, color: "from-blue-400 to-indigo-600" },
                    { name: 'Loaders', count: 18, color: "from-emerald-400 to-teal-600" },
                    { name: 'Rollers', count: 12, color: "from-rose-400 to-pink-600" }
                ].map((dest) => (
                  <div key={dest.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-[#030814] uppercase tracking-widest text-[10px]">{dest.name}</span>
                      <span className="text-amber-600 font-black text-xs">{dest.count}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                      <div 
                        className={`h-full bg-gradient-to-r ${dest.color} rounded-full transition-all duration-1000 ease-out shadow-lg shadow-amber-500/10`}
                        style={{ width: `${dest.count}%` }}
                      />
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-8 pt-6 border-t border-slate-100">
                <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-extrabold text-[12px] uppercase tracking-[0.15em] hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2.5">
                   <TrendingUp size={16} className="text-amber-500" />
                   Generate Report
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
