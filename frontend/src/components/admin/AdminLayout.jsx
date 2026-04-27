import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.png";
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Mail, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Menu,
  ChevronDown,
  Globe,
  Clock,
  ShoppingCart,
  FileText,
  BarChart3,
  Box,
  Wrench,
  Layers
} from "lucide-react";

const SidebarItem = ({ icon: Icon, label, path }) => (
  <NavLink
    to={path}
    end={path === "/admin"}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-4 py-3 mx-3 rounded-xl transition-all duration-500 group relative mb-0.5 ${
        isActive
          ? "sidebar-active-premium font-bold active-glow"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={18} className={`shrink-0 transition-all duration-500 ${isActive ? 'text-amber-500' : 'group-hover:scale-110 group-hover:rotate-3'}`} />
        <span className="text-[13px] tracking-wide">{label}</span>
      </>
    )}
  </NavLink>
);


const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [uaeTime, setUaeTime] = useState("");
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: "Asia/Dubai",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      setUaeTime(new Intl.DateTimeFormat("en-US", options).format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { icon: LayoutDashboard, label: "Home", path: "/admin" },
    { icon: Box, label: "Products", path: "/admin/products" },
    { icon: PlusCircle, label: "Add Product", path: "/admin/add-product" },
    { icon: Wrench, label: "Parts", path: "/admin/parts" },
    { icon: Layers, label: "Gallery", path: "/admin/media" },
    { icon: Mail, label: "Enquiries", path: "/admin/enquiries" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-body antialiased">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[220px] glass-sidebar flex flex-col transition-all duration-500 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-20">
          <img src={logo} alt="Swing360" className="h-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-[#0F172A] font-display font-extrabold text-base leading-tight uppercase tracking-wider">Swing360</span>
            <span className="text-amber-500 text-[9px] font-extrabold uppercase tracking-[0.15em]">Command Center</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1.5 custom-scrollbar">
          {menuItems.map((item) => (
            <SidebarItem key={item.label} icon={item.icon} label={item.label} path={item.path} />
          ))}
        </div>


        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 w-full rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 group"
          >
            <LogOut size={18} className="shrink-0 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-[68px] bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-30 shrink-0 sticky top-0">
          <div className="flex items-center flex-1 gap-6">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            
            {/* Search */}
            <div className="hidden md:flex items-center max-w-sm w-full bg-slate-100/50 rounded-xl px-4 py-2 border border-slate-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500 transition-all group shadow-sm">
              <Search size={16} className="text-slate-400 mr-2.5 shrink-0 group-focus-within:text-amber-500 transition-all duration-500 group-focus-within:scale-110" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none w-full text-[13px] font-semibold text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* UAE Time */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Dubai, UAE</span>
                <span className="text-[12px] font-extrabold text-slate-700 leading-tight">{uaeTime}</span>
              </div>
            </div>

            <button 
              className="hidden sm:flex items-center gap-2 btn-quick-add-premium px-4 py-2.5 rounded-xl text-[12px] font-extrabold"
              onClick={() => navigate("/admin/add-product")}
            >
              <PlusCircle size={16} className="animate-pulse-subtle" />
              <span>Quick Add</span>
            </button>

            <div className="relative group">
              <button className="flex items-center justify-center w-9 h-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-all">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full ring-2 ring-white"></span>
              </button>
              
              {/* Notifications Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                  <span className="font-extrabold text-slate-900">Notifications</span>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded">3 New</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="text-[13px] font-extrabold text-slate-900">New Inquiry: CAT 320D</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">2 minutes ago from India</div>
                  </div>
                  <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="text-[13px] font-extrabold text-slate-900">Payment Verified: Hub#12</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">1 hour ago</div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="text-[13px] font-extrabold text-slate-900">System Update Complete</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Yesterday</div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-b-2xl text-center">
                  <button className="text-[11px] font-extrabold text-slate-500 hover:text-amber-500">View All Notifications</button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 ml-1">
              <div className="hidden lg:flex flex-col items-end mr-1">
                <span className="text-[12px] font-extrabold text-slate-900 leading-none">{user?.username || "Admin User"}</span>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Global Manager</span>
              </div>
              <div className="flex items-center gap-2 p-1 rounded-xl transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-[#030814] flex items-center justify-center text-amber-500 text-sm font-extrabold shadow-md">
                  {user?.username?.[0]?.toUpperCase() || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#F8FAFC] p-5 lg:p-6">
          <div className="w-full max-w-[1640px] mx-auto px-5 lg:px-7">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

