import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Parts", path: "/parts" },
  { label: "Gallery", path: "/gallery" },
  { label: "Contact Us", path: "/contact-us" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);
  
  const handleHomeClick = (e) => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled 
          ? "bg-white/90 backdrop-blur-xl border-primary/10 shadow-lg" 
          : "bg-white/80 backdrop-blur-md border-border/20 shadow-sm"
      }`}
    >
      <div className="w-full max-w-[1520px] mx-auto px-6 md:px-12 flex items-center justify-between h-[72px] transition-all duration-500">
        {/* ── Logo + Brand Name ── */}
        <Link to="/" onClick={handleHomeClick} className="flex items-center gap-4 group">
          <img
            src={logo}
            alt="Swing360 EXIM"
            className="h-12 w-auto drop-shadow-xl group-hover:scale-105 transition-all duration-500"
          />
          <div className="hidden sm:flex flex-col leading-tight pt-1">
            <span className="font-display font-black text-heading text-[18px] tracking-tight transition-all duration-500">
              Swing<span className="text-primary drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">360</span>
            </span>
            <span className="font-display font-black text-[11px] md:text-[12px] text-primary uppercase tracking-[0.38em] mt-1 transition-all duration-300 opacity-100 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              EXIM TRADING
            </span>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center">
          <div className="flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={link.path === "/" ? handleHomeClick : undefined}
                className={`nav-link-hover relative font-display text-[14px] font-extrabold transition-all duration-400 py-2 ${
                  location.pathname === link.path
                    ? "text-primary text-shadow-sm"
                    : "text-heading/80 hover:text-primary transition-colors"
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-[2.5px] rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(38 92% 50%), hsl(28 88% 42%))",
                      boxShadow: "0 0 10px rgba(245,158,11,0.5)",
                    }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 250, damping: 25 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Mobile toggle ── */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-heading p-2 rounded-xl hover:bg-muted/50 transition-colors"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden overflow-hidden border-t border-border/30"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(24px)",
            }}
          >
            <div className="container-section py-8 flex flex-col gap-3">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={link.path === "/" ? handleHomeClick : undefined}
                    className={`font-display text-lg font-extrabold py-3.5 px-6 rounded-xl transition-all duration-300 block ${
                      location.pathname === link.path
                        ? "text-primary bg-primary/10 shadow-[inner_0_0_0_1px_rgba(245,158,11,0.2)]"
                        : "text-heading hover:bg-muted/50 hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
