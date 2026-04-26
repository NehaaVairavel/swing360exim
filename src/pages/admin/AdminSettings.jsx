import { useState, useEffect } from "react";
import settingsService from "@/services/settingsService";
import { 
  Building, 
  Mail, 
  Lock, 
  LogOut, 
  Globe, 
  Smartphone, 
  MapPin,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const TabButton = ({ active, label, icon: Icon, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all text-sm whitespace-nowrap ${
      active 
        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 translate-x-2" 
        : "text-slate-500 hover:text-[#0F172A] hover:bg-white"
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

const Section = ({ title, description, children }) => (
  <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
    <div className="mb-8 pb-6 border-b border-slate-100">
      <h2 className="text-2xl font-display font-bold text-[#0F172A]">{title}</h2>
      <p className="text-slate-500 text-sm mt-1 font-medium">{description}</p>
    </div>
    {children}
  </div>
);

const Input = ({ label, icon: Icon, type = "text", value, onChange, name, ...props }) => (
  <div className="mb-6">
    <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />}
      <input 
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm text-slate-700 font-medium`} 
        {...props} 
      />
    </div>
  </div>
);

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("company");
  const [settings, setSettings] = useState({
    company_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    hero_text: ""
  });
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        if (data.company_name) setSettings(data);
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await settingsService.update(settings);
      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Opening Settings...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
        <div className="lg:w-72 space-y-2 shrink-0">
          <div className="mb-8 px-2">
            <h1 className="text-3xl font-display font-bold text-[#0F172A] tracking-tight">Settings</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Control center configuration</p>
          </div>
          
          <TabButton active={activeTab === "company"} label="Company Profile" icon={Building} onClick={() => setActiveTab("company")} />
          <TabButton active={activeTab === "website"} label="Website Settings" icon={Globe} onClick={() => setActiveTab("website")} />
          <TabButton active={activeTab === "security"} label="Security & Access" icon={Lock} onClick={() => setActiveTab("security")} />
          
          <div className="pt-8 mt-8 border-t border-slate-200 px-2">
            <button onClick={logout} className="flex items-center gap-3 text-rose-500 font-bold text-sm hover:translate-x-1 transition-transform">
              <LogOut size={18} />
              Logout from Dashboard
            </button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === "company" && (
            <Section title="Company Profile" description="Manage your business information and global presence">
              <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <Input label="Company Name" name="company_name" value={settings.company_name} onChange={handleInputChange} icon={Building} />
                  <Input label="Support Email" name="email" value={settings.email} onChange={handleInputChange} icon={Mail} />
                  <Input label="Phone Number" name="phone" value={settings.phone} onChange={handleInputChange} icon={Smartphone} />
                  <Input label="WhatsApp Number" name="whatsapp" value={settings.whatsapp} onChange={handleInputChange} icon={MessageCircle} />
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                   <button type="submit" className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg">Save Changes</button>
                </div>
              </form>
            </Section>
          )}

          {activeTab === "website" && (
            <Section title="Website Settings" description="Configure your public facing website appearance">
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Hero Section Title</label>
                <textarea 
                  name="hero_text"
                  value={settings.hero_text}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl h-32 focus:outline-none text-sm font-medium" 
                  placeholder="Welcome to Swing360..."
                ></textarea>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                 <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold">Save Website Config</button>
              </div>
            </Section>
          )}

          {activeTab === "security" && (
            <Section title="Security & Access" description="Manage password policies and account protection">
              <div className="max-w-md space-y-6">
                <Input label="Current Password" type="password" icon={Lock} />
                <Input label="New Password" type="password" icon={Lock} />
                <Input label="Confirm New Password" type="password" icon={Lock} />
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                 <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold">Update Credentials</button>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
