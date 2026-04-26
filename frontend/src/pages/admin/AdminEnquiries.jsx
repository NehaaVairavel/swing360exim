import { useState, useMemo, useEffect } from "react";
import enquiryService from "@/services/enquiryService";
import { 
  Search, 
  Mail, 
  Phone, 
  Download,
  Filter,
  CheckCircle,
  Eye,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCountry, setActiveCountry] = useState("All");

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const data = await enquiryService.getAll();
        setEnquiries(data);
      } catch (error) {
        toast.error("Failed to load enquiries");
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      const matchesSearch = (e.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (e.interested_product || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = activeCountry === "All" || e.country === activeCountry;
      return matchesSearch && matchesCountry;
    });
  }, [searchQuery, activeCountry, enquiries]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await enquiryService.updateStatus(id, newStatus);
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await enquiryService.delete(id);
      setEnquiries(prev => prev.filter(e => e.id !== id));
      toast.success("Enquiry deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const countries = ["All", ...new Set(enquiries.map(e => e.country).filter(Boolean))];

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Loading Leads...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#0F172A] tracking-tight">Client Enquiries</h1>
          <p className="text-slate-500 font-medium mt-1">Manage global machinery requests and leads</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-[#0F172A] px-6 py-3 rounded-2xl font-bold transition-all shadow-sm">
          <Download size={20} className="text-amber-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search enquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3 ml-4">
             <Filter size={16} className="text-slate-400" />
             <select 
                value={activeCountry}
                onChange={(e) => setActiveCountry(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
             >
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                <th className="p-6 px-8">Client</th>
                <th className="p-6">Contact Info</th>
                <th className="p-6">Interested Product</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEnquiries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-6 px-8">
                    <div className="font-bold text-[#0F172A]">{e.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(e.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail size={12} className="text-slate-400" />
                        {e.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Phone size={12} className="text-slate-400" />
                        {e.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-bold text-slate-700">{e.interested_product || "General Inquiry"}</div>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">{e.country || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      e.status === 'new' ? "bg-amber-50 text-amber-600 border-amber-200/50" : "bg-emerald-50 text-emerald-600 border-emerald-200/50"
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleStatusUpdate(e.id, 'contacted')}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-emerald-500 transition-all" 
                        title="Mark as Contacted"
                       >
                        <CheckCircle size={18} />
                       </button>
                       <button onClick={() => handleDelete(e.id)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-rose-500 transition-all" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEnquiries;
