import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import productService from "@/services/productService";
import {
  ArrowLeft, UploadCloud, Trash2, Image as ImageIcon,
  Send, Info, DollarSign, MapPin, Clock, Eye,
  CheckCircle, Zap, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrency, CURRENCY_META } from "@/context/CurrencyContext";
import "@/styles/admin.css";

/* ── Status badge preview ── */
const StatusPreview = ({ status }) => {
  const cfg = {
    in_stock:    { label: "In Stock",    bg: "linear-gradient(135deg,#22c55e,#16a34a)", shadow: "rgba(34,197,94,0.4)" },
    coming_soon: { label: "Coming Soon", bg: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "rgba(245,158,11,0.35)" },
    sold:        { label: "Sold",        bg: "linear-gradient(135deg,#ef4444,#b91c1c)", shadow: "rgba(239,68,68,0.35)" },
  }[status];
  if (!cfg) return null;
  return (
    <span style={{
      padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
      fontFamily: "'Inter',sans-serif", color: "#fff", textTransform: "uppercase",
      letterSpacing: "0.06em", background: cfg.bg,
      boxShadow: `0 4px 12px ${cfg.shadow}`,
    }}>{cfg.label}</span>
  );
};

/* ── Section wrapper ── */
const Section = ({ title, subtitle, icon: Icon, children, id }) => (
  <div id={id} className="admin-card mb-5" style={{ borderRadius: 24, padding: "22px 24px" }}>
    <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid #F1F3F7" }}>
      <div className="flex items-center justify-center shrink-0"
        style={{ width: 34, height: 34, borderRadius: 10, background: "#FEF9EC", color: "#F5B301" }}>
        <Icon size={16} />
      </div>
      <div>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#111827", margin: 0 }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#94A3B8", margin: "2px 0 0", fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {children}
  </div>
);

/* ── Validated Input ── */
const Input = ({ label, required, error, hint, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
      {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
    </label>
    <input
      className="admin-input"
      style={{ borderColor: error ? "#EF4444" : undefined, boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.1)" : undefined }}
      {...props}
    />
    {error && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ {error}</p>}
    {hint && !error && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{hint}</p>}
  </div>
);

/* ── Select ── */
const Select = ({ label, required, options, error, ...props }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
      {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
    </label>
    <select className="admin-select"
      style={{ borderColor: error ? "#EF4444" : undefined }}
      {...props}>
      <option value="">Select {label}</option>
      {options && options.filter(Boolean).map(opt => (
        <option key={opt?.id || opt} value={opt?.id || opt}>{opt?.name || opt}</option>
      ))}
    </select>
    {error && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ {error}</p>}
  </div>
);

/* ── Live Preview Card ── */
const PreviewCard = ({ formData, images }) => {
  const price = parseFloat(String(formData.price).replace(/[^0-9.]/g, "")) || 0;
  const symbol = CURRENCY_META[formData.currency]?.symbol || "$";
  const isSold = formData.availability === "sold";

  return (
    <div style={{
      background: "#fff", borderRadius: 20, border: "1px solid #EEF1F5",
      boxShadow: "0 8px 32px rgba(15,23,42,0.08)", overflow: "hidden",
    }}>
      {/* Image */}
      <div style={{ height: 160, background: "#F1F5F9", position: "relative", overflow: "hidden" }}>
        {images[0] ? (
          <img src={images[0]} alt="" style={{
            width: "100%", height: "100%", objectFit: "cover",
            filter: isSold ? "grayscale(80%)" : "none",
          }} />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: "#CBD5E1" }}>
            <ImageIcon size={36} />
          </div>
        )}
        {/* Status badge */}
        {formData.availability && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <StatusPreview status={formData.availability} />
          </div>
        )}
        {/* Year badge */}
        {formData.year && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: "#fff", borderRadius: 999, padding: "4px 10px",
            fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700,
            color: "#111827", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}>{formData.year}</div>
        )}
        {/* Image count */}
        {images.length > 1 && (
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)",
            borderRadius: 999, padding: "3px 8px",
            fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: "#fff",
          }}>+{images.length - 1} more</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px" }}>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>
          {formData.brand || "Brand"} · {formData.category || "Category"}
        </p>
        <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px", lineHeight: 1.2 }}>
          {formData.name || "Product Name"}
        </h3>
        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          {formData.engine_hours && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#94A3B8" }}>
              <Clock size={10} /> {formData.engine_hours} Hrs
            </span>
          )}
          {formData.location && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#94A3B8" }}>
              <MapPin size={10} /> {formData.location.split(",")[0]}
            </span>
          )}
        </div>
        <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Export Price</p>
          <p style={{
            fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800,
            color: isSold ? "#94A3B8" : "#F5B301",
            textDecoration: isSold ? "line-through" : "none", margin: 0,
          }}>
            {price > 0 ? `${symbol}${price.toLocaleString()}` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Main AddProduct Page ── */
const AddProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [draftSaved, setDraftSaved] = useState(null);
  const { convertAll, ratesLoaded, rateDate } = useCurrency();

  const [formData, setFormData] = useState({
    name: "", brand: "", model: "", year: "", category: "",
    condition: "Used", price: "", currency: "USD",
    engine_hours: "", availability: "in_stock",
    location: "Dubai, UAE", full_description: "",
  });

  /* Load draft */
  useEffect(() => {
    const saved = localStorage.getItem("swing360_draft");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
        toast.info("Draft restored", { duration: 2000 });
      } catch {}
    }
  }, []);

  /* Auto-save draft every 5s */
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem("swing360_draft", JSON.stringify(formData));
      setDraftSaved(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, [formData]);

  useEffect(() => {
    productService.getCategories()
      .then(d => setCategories((Array.isArray(d) ? d : []).filter(Boolean)))
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    setImages(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    toast.success(`${files.length} image${files.length > 1 ? "s" : ""} added`);
  };

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name) errs.name = "Product name is required";
    if (!formData.category) errs.category = "Please select a category";
    if (!formData.year) errs.year = "Year is required";
    if (formData.year && (formData.year < 1980 || formData.year > 2025)) errs.year = "Enter a valid year (1980–2025)";
    if (!formData.engine_hours) errs.engine_hours = "Engine hours required";
    if (formData.engine_hours && isNaN(Number(formData.engine_hours))) errs.engine_hours = "Must be a number";
    if (!formData.price) errs.price = "Price is required";
    if (formData.price && isNaN(parseFloat(String(formData.price).replace(/[^0-9.]/g, "")))) errs.price = "Enter a valid numeric price";
    if (!formData.location) errs.location = "Location is required";
    if (!formData.availability) errs.availability = "Select an availability status";
    if (imageFiles.length === 0) errs.images = "At least one image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSubmitting(true);
    try {
      let finalImageUrls = [];
      if (imageFiles.length > 0) {
        toast.info(`Uploading ${imageFiles.length} image(s)...`);
        const uploadRes = await productService.uploadImages(imageFiles);
        finalImageUrls = uploadRes.urls || [];
      }
      const payload = {
        ...formData,
        images: finalImageUrls,
        image: finalImageUrls[0] || null,
      };
      await productService.create(payload);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      localStorage.removeItem("swing360_draft");
      toast.success("Equipment published successfully!");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to publish product");
    } finally {
      setSubmitting(false);
    }
  };

  const priceNum = parseFloat(String(formData.price).replace(/[^0-9.]/g, "")) || 0;
  // Convert from entered currency to USD first, then to others via live rates
  const conversions = priceNum > 0 ? convertAll(priceNum) : [];
  const descLen = (formData.full_description || "").length;

  return (
    <div style={{ animation: "fadeIn 0.5s ease", maxWidth: 1300, margin: "0 auto", paddingBottom: 80 }}>

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-4 mb-6"
        style={{ background: "#F6F7FB", borderBottom: "1px solid #EAECEF", marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center transition-all"
            style={{ width: 38, height: 38, borderRadius: 11, background: "#fff", border: "1px solid #EAECEF", color: "#64748B", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#F5B301"; e.currentTarget.style.color = "#F5B301"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#EAECEF"; e.currentTarget.style.color = "#64748B"; }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>Add New Equipment</h1>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#94A3B8", margin: 0 }}>
              Create a premium listing for the global market
              {draftSaved && <span style={{ marginLeft: 10, color: "#22C55E" }}>✓ Draft saved {Math.round((Date.now() - draftSaved) / 1000)}s ago</span>}
            </p>
          </div>
        </div>
        <button disabled={submitting} onClick={handleSubmit} className="btn-accent flex items-center gap-2"
          style={{ opacity: submitting ? 0.65 : 1 }}>
          <Send size={15} />
          {submitting ? "Publishing..." : "Publish Product"}
        </button>
      </div>

      {/* ── 3-col layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — 2 cols */}
        <div className="lg:col-span-2">

          <Section id="basic" title="Machine Specifications" subtitle="Core details shown on the public marketplace listing" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <Input label="Product Name" name="name" value={formData.name} onChange={handleInputChange}
                placeholder="e.g. Caterpillar 320 GC" required error={errors.name} />
              <Select label="Category" name="category" value={formData.category} onChange={handleInputChange}
                options={categories} required error={errors.category} />
              <Input label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Caterpillar" />
              <Input label="Model Number" name="model" value={formData.model} onChange={handleInputChange} placeholder="320 GC" />
              <Input label="Year" name="year" type="number" value={formData.year} onChange={handleInputChange}
                placeholder="Manufacturing year" required error={errors.year} hint="Enter year between 1980–2025" />
              <Select label="Condition" name="condition" value={formData.condition} onChange={handleInputChange}
                options={["New", "Used", "Refurbished"]} required />
              <Input label="Engine Hours" name="engine_hours" type="number" value={formData.engine_hours}
                onChange={handleInputChange} placeholder="e.g. 1200" required error={errors.engine_hours} hint="Must be a numeric value" />
              <Input label="Location" name="location" value={formData.location} onChange={handleInputChange}
                placeholder="e.g. Dubai, UAE" required error={errors.location} />
              <div style={{ gridColumn: "1 / -1" }}>
                <Select label="Availability Status" name="availability" value={formData.availability} onChange={handleInputChange}
                  options={[{ id: "in_stock", name: "In Stock" }, { id: "coming_soon", name: "Coming Soon" }, { id: "sold", name: "Sold" }]}
                  required error={errors.availability} />
                {/* Live status preview */}
                {formData.availability && (
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#94A3B8" }}>Live badge preview:</span>
                    <StatusPreview status={formData.availability} />
                  </div>
                )}
              </div>
            </div>

            {/* Description with character counter */}
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 600, color: "#374151" }}>
                  Description <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <span style={{
                  fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600,
                  color: descLen > 900 ? "#EF4444" : descLen > 600 ? "#F59E0B" : "#94A3B8",
                }}>{descLen} / 1000</span>
              </div>
              <textarea name="full_description" value={formData.full_description} onChange={handleInputChange}
                className="admin-textarea" maxLength={1000}
                style={{ height: 100, borderColor: descLen > 1000 ? "#EF4444" : undefined }}
                placeholder="Describe the machine's features, history, and technical condition..." />
            </div>
          </Section>

          <Section id="pricing" title="Pricing & Marketplace Visibility" subtitle="Export price shown publicly to international buyers" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <Input label="Price" name="price" value={formData.price} onChange={handleInputChange}
                type="text" placeholder="e.g. 125000" required error={errors.price} />
              <Select label="Currency" name="currency" value={formData.currency} onChange={handleInputChange}
                options={[{ id: "USD", name: "USD $" }, { id: "AED", name: "AED د.إ" }, { id: "EUR", name: "EUR €" }, { id: "INR", name: "INR ₹" }]}
                required />
            </div>
            {/* Currency conversion preview — live rates */}
            {conversions.length > 0 && (
              <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 14px", border: "1px solid #E2E8F0" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                    <Zap size={10} style={{ display: "inline", marginRight: 4 }} />Live Conversion Preview
                  </p>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif", fontSize: 10, color: ratesLoaded ? "#22C55E" : "#94A3B8", fontWeight: 600 }}>
                    <RefreshCw size={9} />
                    {ratesLoaded && rateDate ? `Updated ${rateDate.toLocaleDateString()}` : "Loading rates..."}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {conversions.map(({ currency, symbol, flag, value }) => (
                    <div key={currency} style={{ background: "#fff", borderRadius: 8, padding: "6px 12px", border: "1px solid #E2E8F0" }}>
                      <span style={{ fontSize: 11, marginRight: 4 }}>{flag}</span>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{currency} </span>
                      <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: "#111827" }}>
                        {symbol}{value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-5">

          {/* Media Upload */}
          <Section id="media" title="Media Gallery" subtitle="First image becomes the cover photo" icon={ImageIcon}>
            <div className={`upload-zone flex flex-col items-center justify-center p-6 mb-4 ${isDragging ? "dragging" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}>
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*"
                onChange={e => e.target.files && handleFiles(e.target.files)} />
              <UploadCloud size={24} style={{ color: "#F5B301", marginBottom: 8 }} />
              <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, color: "#374151", textAlign: "center", marginBottom: 2 }}>
                Drag & Drop or Click
              </p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#94A3B8", textAlign: "center" }}>
                {images.length > 0 ? `${images.length} image${images.length > 1 ? "s" : ""} selected` : "PNG, JPG up to 10MB each"}
              </p>
            </div>
            {errors.images && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#EF4444", marginBottom: 8 }}>⚠ {errors.images}</p>}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, idx) => (
                  <div key={idx} className="relative group" style={{ aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid #EAECEF" }}>
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    {idx === 0 && (
                      <div style={{ position: "absolute", top: 3, left: 3, background: "#F5B301", borderRadius: 5, padding: "2px 5px", fontFamily: "'Inter',sans-serif", fontSize: 7, fontWeight: 800, color: "#111827" }}>
                        COVER
                      </div>
                    )}
                    <button type="button" onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ width: 20, height: 20, borderRadius: 5, background: "#EF4444", color: "#fff", border: "none", cursor: "pointer" }}>
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Live Preview */}
          <Section id="preview" title="Public Card Preview" subtitle="How buyers see this listing" icon={Eye}>
            <PreviewCard formData={formData} images={images} />
          </Section>

          {/* Publish hint */}
          <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 16, padding: "16px 18px" }}>
            <div className="flex items-start gap-3">
              <CheckCircle size={16} style={{ color: "#16A34A", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 12, color: "#15803D", marginBottom: 3 }}>Ready to Publish</p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#16A34A", opacity: 0.85 }}>
                  Listings go live globally instantly. Draft auto-saved every 5 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AddProduct;
