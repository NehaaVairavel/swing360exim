import { useState, useEffect } from "react";
import publicService from "@/services/publicService";
import enquiryService from "@/services/enquiryService";
import { 
  CheckCircle, 
  Mail, 
  TrendingUp, 
  TrendingDown,
  Globe, 
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


      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <KpiCard title="Total Inventory" value={stats.total_products} icon={Box} trend="+12" trendUp={true} />
        <KpiCard title="Active Listings" value={stats.available_products} icon={Globe} trend="+5" trendUp={true} />
        <KpiCard title="Sold Units" value={stats.sold_products} icon={CheckCircle} trend="+8" trendUp={true} />
        <KpiCard title="Total Leads" value={stats.enquiries_count} icon={Mail} trend="+15" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Enquiries Table */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000">
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

      </div>
    </div>
  );
};

export default Dashboard;
