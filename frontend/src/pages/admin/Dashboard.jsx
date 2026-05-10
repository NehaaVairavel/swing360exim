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


const colorMap = {
  orange: {
    bg: 'bg-orange-50',
    iconText: 'text-orange-600',
    iconHoverBg: 'group-hover:bg-orange-500',
    borderHover: 'group-hover:border-orange-400',
    shadowHover: 'group-hover:shadow-orange-500/40',
    lineStroke: '#f97316', 
    glow: 'group-hover:shadow-[0_12px_40px_-10px_rgb(249,115,22,0.5)]',
  },
  cyan: {
    bg: 'bg-cyan-50',
    iconText: 'text-cyan-600',
    iconHoverBg: 'group-hover:bg-cyan-500',
    borderHover: 'group-hover:border-cyan-400',
    shadowHover: 'group-hover:shadow-cyan-500/40',
    lineStroke: '#06b6d4', 
    glow: 'group-hover:shadow-[0_12px_40px_-10px_rgb(6,182,212,0.5)]',
  },
  green: {
    bg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    iconHoverBg: 'group-hover:bg-emerald-500',
    borderHover: 'group-hover:border-emerald-400',
    shadowHover: 'group-hover:shadow-emerald-500/40',
    lineStroke: '#10b981', 
    glow: 'group-hover:shadow-[0_12px_40px_-10px_rgb(16,185,129,0.5)]',
  },
  purple: {
    bg: 'bg-purple-50',
    iconText: 'text-purple-600',
    iconHoverBg: 'group-hover:bg-purple-500',
    borderHover: 'group-hover:border-purple-400',
    shadowHover: 'group-hover:shadow-purple-500/40',
    lineStroke: '#a855f7', 
    glow: 'group-hover:shadow-[0_12px_40px_-10px_rgb(168,85,247,0.5)]',
  }
};

const KpiCard = ({ title, value, icon: Icon, trend, trendUp, prefix = "", color = "orange" }) => {
  const theme = colorMap[color] || colorMap.orange;
  
  return (
  <div className={`bg-white rounded-[2rem] p-6 group border border-slate-200/60 shadow-lg shadow-slate-200/30 hover:-translate-y-2 hover:border-transparent transition-all duration-500 relative overflow-hidden ${theme.glow}`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-2xl ${theme.bg} flex items-center justify-center ${theme.iconText} ${theme.iconHoverBg} group-hover:text-white group-hover:rotate-6 group-hover:scale-110 transition-all duration-700 shadow-sm border border-slate-100 ${theme.borderHover} ${theme.shadowHover}`}>
        <Icon size={24} />
      </div>
      <div className="flex flex-col items-end">
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} shadow-sm`}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{trend}</span>
        </div>
        {/* Animated Sparkline */}
        <div className="h-10 w-24 mt-4 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
           <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path 
                d={trendUp ? "M0,25 Q15,20 30,22 T60,10 T100,5" : "M0,5 Q20,10 40,20 T70,15 T100,25"} 
                fill="none" 
                stroke={theme.lineStroke} 
                strokeWidth="3" 
                strokeLinecap="round"
                className="chart-line"
              />
           </svg>
        </div>
      </div>
    </div>
    <div className="mt-auto">
      <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
      <div className="flex items-end gap-2">
        <h3 className="admin-stats-number text-[#030814] drop-shadow-sm">
          <CountUp end={value} prefix={prefix} />
        </h3>
        <span className="text-[11px] font-extrabold text-slate-400 mb-2 italic">Live</span>
      </div>
    </div>
  </div>
  );
};

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard title="Total Inventory" value={stats.total_products} icon={Box} trend="+12" trendUp={true} color="orange" />
        <KpiCard title="Active Listings" value={stats.available_products} icon={Globe} trend="+5" trendUp={true} color="cyan" />
        <KpiCard title="Sold Units" value={stats.sold_products} icon={CheckCircle} trend="+8" trendUp={true} color="green" />
        <KpiCard title="Total Leads" value={stats.enquiries_count} icon={Mail} trend="+15" trendUp={true} color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Enquiries Table */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="p-6 lg:p-7 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h2 className="admin-dashboard-title text-[#030814]">Global Inquiries</h2>
                <p className="text-slate-400 text-[13px] font-semibold mt-0.5">Live feed of active machinery export requests</p>
            </div>
            <Link to="/admin/enquiries" className="px-5 py-2 bg-slate-50 text-slate-900 admin-btn text-[13px] hover:bg-slate-900 hover:text-white rounded-lg transition-all duration-500 shadow-sm border border-slate-200">View Full Log</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-4 admin-table-header text-slate-400">Client / Origin</th>
                  <th className="px-8 py-4 admin-table-header text-slate-400">Machinery Requested</th>
                  <th className="px-8 py-4 admin-table-header text-slate-400 text-center">Lifecycle</th>
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
