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
  Box,
  Wrench,
  Layers,
  X,
} from "lucide-react";
import "@/styles/admin.css";

/* ─── Sidebar Navigation Item ─── */
const SidebarItem = ({ icon: Icon, label, path, onClick }) => (
  <NavLink
    to={path}
    end={path === "/admin"}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 mx-3 rounded-2xl transition-all duration-300 group relative mb-1 ${
        isActive
          ? "sidebar-active-premium admin-sidebar-label text-[#111827]"
          : "text-[#64748B] hover:text-[#111827] hover:bg-[#F6F7FB]"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <Icon
          size={17}
          className={`shrink-0 transition-all duration-300 ${
            isActive
              ? "text-[#111827]"
              : "group-hover:translate-x-0.5 group-hover:text-[#111827]"
          }`}
        />
        <span className="admin-sidebar-label">{label}</span>
      </>
    )}
  </NavLink>
);

/* ─── Main AdminLayout ─── */
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

  const toggleSidebar = () => setSidebarOpen((p) => !p);

  const menuItems = [
    { icon: LayoutDashboard, label: "Home", path: "/admin" },
    { icon: Box, label: "Products", path: "/admin/products" },
    { icon: PlusCircle, label: "Add Product", path: "/admin/add-product" },
    { icon: Wrench, label: "Parts", path: "/admin/parts" },
    { icon: Layers, label: "Gallery", path: "/admin/media" },
    { icon: Mail, label: "Enquiries", path: "/admin/enquiries" },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden antialiased"
      style={{ background: "#F6F7FB", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(17,24,39,0.45)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════ SIDEBAR ══════════════════════════ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: "230px",
          minWidth: "230px",
          background: "#ffffff",
          borderRight: "1px solid #EAECEF",
          boxShadow: "4px 0 20px rgba(15,23,42,0.04)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 shrink-0"
          style={{
            height: "68px",
            borderBottom: "1px solid #EAECEF",
          }}
        >
          <div
            className="flex items-center justify-center shrink-0 overflow-hidden"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "#F6F7FB",
              border: "1px solid #EAECEF",
            }}
          >
            <img src={logo} alt="Swing360" className="h-5 w-auto object-contain" />
          </div>
          <div className="flex flex-col">
            <span
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "17px",
                color: "#111827",
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              Swing360
            </span>
            <span
              className="admin-label-small"
              style={{ color: "#F5B301", fontSize: "9px" }}
            >
              Command Center
            </span>
          </div>

          {/* Mobile close */}
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ color: "#64748B" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation section label */}
        <div className="px-6 pt-6 pb-2">
          <span
            className="admin-label-small"
            style={{ color: "#CBD5E1", fontSize: "9px" }}
          >
            Navigation
          </span>
        </div>

        {/* Menu items */}
        <nav
          className="flex-1 overflow-y-auto custom-scrollbar py-1 flex flex-col"
          style={{ gap: "2px" }}
        >
          {menuItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              path={item.path}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Divider */}
        <div className="sidebar-separator" />

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl transition-all duration-300 group"
            style={{ color: "#64748B" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFF1F2";
              e.currentTarget.style.color = "#BE123C";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#64748B";
            }}
          >
            <LogOut
              size={17}
              className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            <span className="admin-sidebar-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════ MAIN CONTENT ══════════════════════════ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── TOP NAVBAR ── */}
        <header
          className="shrink-0 sticky top-0 z-30 flex items-center justify-between px-5 sm:px-7"
          style={{
            height: "68px",
            background: "#ffffff",
            borderBottom: "1px solid #EAECEF",
            boxShadow: "0 1px 0 #EAECEF",
          }}
        >
          {/* Left side */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: "#64748B" }}
              onClick={toggleSidebar}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F7FB")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Menu size={22} />
            </button>

            {/* Search bar */}
            <div
              className="hidden md:flex items-center gap-2 flex-1 max-w-[340px]"
              style={{
                background: "#F6F7FB",
                border: "1px solid #EAECEF",
                borderRadius: "14px",
                padding: "10px 16px",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#F5B301";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,179,1,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "#F6F7FB";
                e.currentTarget.style.borderColor = "#EAECEF";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Search size={15} style={{ color: "#94A3B8", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search products, enquiries..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#111827",
                }}
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* UAE Time badge */}
            <div
              className="hidden xl:flex items-center gap-2 px-3 py-2"
              style={{
                background: "#F6F7FB",
                border: "1px solid #EAECEF",
                borderRadius: "12px",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#22C55E" }}
              />
              <div className="flex flex-col">
                <span
                  className="admin-label-small"
                  style={{ color: "#94A3B8", fontSize: "8px" }}
                >
                  Dubai, UAE
                </span>
                <span
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 700,
                    fontSize: "12px",
                    color: "#111827",
                    lineHeight: 1.2,
                  }}
                >
                  {uaeTime}
                </span>
              </div>
            </div>

            {/* Quick Add */}
            <button
              className="hidden sm:flex btn-quick-add-premium items-center gap-2"
              style={{ padding: "10px 18px", borderRadius: "14px" }}
              onClick={() => navigate("/admin/add-product")}
            >
              <PlusCircle size={15} />
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: "13px" }}>
                Quick Add
              </span>
            </button>

            {/* Notification bell */}
            <div className="relative group">
              <button
                className="flex items-center justify-center rounded-xl transition-all relative"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#F6F7FB",
                  border: "1px solid #EAECEF",
                  color: "#64748B",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
              >
                <Bell size={17} />
                <span
                  className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full ring-2 ring-white"
                  style={{ background: "#F5B301" }}
                />
              </button>

              {/* Notification dropdown */}
              <div
                className="notif-dropdown absolute right-0 top-full mt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                style={{ transform: "translateY(-4px)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: "1px solid #F1F3F7" }}
                >
                  <span
                    style={{
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#111827",
                    }}
                  >
                    Notifications
                  </span>
                  <span
                    className="status-pill status-pill-new"
                    style={{ fontSize: "9px" }}
                  >
                    3 New
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {[
                    { title: "New Inquiry: CAT 320D", time: "2 minutes ago · India" },
                    { title: "Payment Verified: Hub#12", time: "1 hour ago" },
                    { title: "System Update Complete", time: "Yesterday" },
                  ].map((n, i) => (
                    <div
                      key={i}
                      className="px-5 py-3.5 cursor-pointer transition-colors"
                      style={{ borderBottom: "1px solid #F8FAFC" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#F8FAFC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "#111827",
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "11px",
                          color: "#94A3B8",
                          marginTop: "2px",
                        }}
                      >
                        {n.time}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="px-5 py-3 text-center"
                  style={{ borderTop: "1px solid #F1F3F7" }}
                >
                  <button
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#64748B",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F5B301")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className="hidden sm:block w-px h-8 mx-1"
              style={{ background: "#EAECEF" }}
            />

            {/* Admin profile */}
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="hidden lg:flex flex-col items-end">
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#111827",
                  }}
                >
                  {user?.username || "Admin User"}
                </span>
                <span
                  className="admin-label-small"
                  style={{
                    background: "#FEF9EC",
                    color: "#B45309",
                    border: "1px solid #FDE68A",
                    borderRadius: "6px",
                    padding: "2px 6px",
                    fontSize: "8px",
                  }}
                >
                  Global Manager
                </span>
              </div>
              <div
                className="flex items-center justify-center text-sm font-bold transition-all duration-300"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "#111827",
                  color: "#F5B301",
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 800,
                  boxShadow: "0 2px 8px rgba(17,24,39,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(245,179,1,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(17,24,39,0.2)";
                }}
              >
                {user?.username?.[0]?.toUpperCase() || "A"}
              </div>
              <ChevronDown
                size={14}
                style={{ color: "#CBD5E1" }}
                className="group-hover:text-[#64748B] transition-colors"
              />
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <div
          className="flex-1 overflow-auto"
          style={{ background: "#F6F7FB", padding: "28px 24px" }}
        >
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
