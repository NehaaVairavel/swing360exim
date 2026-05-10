import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import productService from "@/services/productService";
import {
  ArrowLeft,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Send,
  Info,
  DollarSign,
  Settings as SettingsIcon,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import "@/styles/admin.css";

/* ─── Form Section wrapper ─── */
const Section = ({ title, icon: Icon, children }) => (
  <div
    className="admin-card p-8 mb-6"
    style={{ borderRadius: "28px" }}
  >
    <div
      className="flex items-center gap-3 mb-7 pb-5"
      style={{ borderBottom: "1px solid #F1F3F7" }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "12px",
          background: "#FEF9EC",
          color: "#F5B301",
        }}
      >
        <Icon size={18} />
      </div>
      <h3
        style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 700,
          fontSize: "17px",
          color: "#111827",
          letterSpacing: "-0.025em",
        }}
      >
        {title}
      </h3>
    </div>
    {children}
  </div>
);

/* ─── Input field ─── */
const Input = ({ label, required, ...props }) => (
  <div style={{ marginBottom: "20px" }}>
    <label
      style={{
        display: "block",
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
        fontWeight: 600,
        color: "#374151",
        marginBottom: "6px",
      }}
    >
      {label}{" "}
      {required && <span style={{ color: "#EF4444" }}>*</span>}
    </label>
    <input className="admin-input" {...props} />
  </div>
);

/* ─── Select field ─── */
const Select = ({ label, required, options, ...props }) => (
  <div style={{ marginBottom: "20px" }}>
    <label
      style={{
        display: "block",
        fontFamily: "'Inter', sans-serif",
        fontSize: "13px",
        fontWeight: 600,
        color: "#374151",
        marginBottom: "6px",
      }}
    >
      {label}{" "}
      {required && <span style={{ color: "#EF4444" }}>*</span>}
    </label>
    <select className="admin-select" {...props}>
      <option value="">Select {label}</option>
      {options &&
        Array.isArray(options) &&
        options.filter(Boolean).map((opt) => (
          <option key={opt?.id || opt} value={opt?.id || opt}>
            {opt?.name || opt}
          </option>
        ))}
    </select>
  </div>
);

/* ─── AddProduct Page ─── */
const AddProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    year: "",
    category: "",
    condition: "Used",
    price: "",
    currency: "USD",
    engine_hours: "",
    availability: "",
    location: "Dubai, UAE",
    full_description: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        setCategories(
          (Array.isArray(categoriesData) ? categoriesData : []).filter(Boolean)
        );
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);
    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newUrls]);
    toast.success(`${files.length} image${files.length > 1 ? "s" : ""} added`);
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "name",
      "category",
      "year",
      "engine_hours",
      "location",
      "availability",
      "price",
      "currency",
    ];
    const missingFields = requiredFields.filter((f) => !formData[f]);
    if (missingFields.length > 0) {
      return toast.error(
        `Please fill in: ${missingFields
          .map((f) => f.replace("_", " "))
          .join(", ")}`
      );
    }
    if (imageFiles.length === 0) {
      return toast.error("At least one product image is required.");
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
        image: finalImageUrls.length > 0 ? finalImageUrls[0] : null,
      };
      await productService.create(payload);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["featuredProducts"] });
      toast.success("Equipment published successfully!");
      navigate("/admin/products");
    } catch (error) {
      const msg = error?.response?.data?.error || "Failed to publish product";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease", maxWidth: "1200px", margin: "0 auto", paddingBottom: "80px" }}>
      {/* ── Sticky top bar ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between mb-8 py-5"
        style={{
          background: "#F6F7FB",
          borderBottom: "1px solid #EAECEF",
          marginLeft: "-24px",
          marginRight: "-24px",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center transition-all duration-200"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "#ffffff",
              border: "1px solid #EAECEF",
              color: "#64748B",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#F5B301";
              e.currentTarget.style.color = "#F5B301";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#EAECEF";
              e.currentTarget.style.color = "#64748B";
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1
              className="admin-dashboard-title"
              style={{ fontSize: "22px", color: "#111827" }}
            >
              Add New Equipment
            </h1>
            <p className="admin-page-subtitle">
              Create a premium listing for the global market
            </p>
          </div>
        </div>

        <button
          disabled={submitting}
          onClick={handleSubmit}
          className="btn-accent flex items-center gap-2"
          style={{ opacity: submitting ? 0.65 : 1 }}
        >
          <Send size={16} />
          {submitting ? "Publishing..." : "Publish Product"}
        </button>
      </div>

      {/* ── Form grid ── */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left col — 2/3 width */}
        <div className="lg:col-span-2">
          <Section title="Basic Information" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Input
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Caterpillar 320 GC"
                required
              />
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categories}
                required
              />
              <Input
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Caterpillar"
              />
              <Input
                label="Model Number"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="320 GC"
              />
              <Input
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                placeholder="Enter manufacturing year"
                required
              />
              <Select
                label="Condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                options={["New", "Used", "Refurbished"]}
                required
              />
              <Input
                label="Engine Hours"
                name="engine_hours"
                value={formData.engine_hours}
                onChange={handleInputChange}
                type="number"
                placeholder="e.g. 1200"
                required
              />
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Dubai, UAE"
                required
              />
              <Select
                label="Availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                options={[
                  { id: "in_stock", name: "In Stock" },
                  { id: "sold", name: "Sold" },
                  { id: "coming_soon", name: "Coming Soon" },
                ]}
                required
              />
            </div>
            <div style={{ marginTop: "8px" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Description <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <textarea
                name="full_description"
                value={formData.full_description}
                onChange={handleInputChange}
                className="admin-textarea"
                style={{ height: "120px" }}
                placeholder="Describe the machine's features, history, and technical condition..."
                required
              />
            </div>
          </Section>

          <Section title="Pricing & Availability" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Input
                label="Price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                type="text"
                placeholder="e.g. 125000"
                required
              />
              <Select
                label="Currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                options={[
                  { id: "INR", name: "INR ₹" },
                  { id: "USD", name: "USD $" },
                  { id: "AED", name: "AED د.إ" },
                  { id: "EUR", name: "EUR €" },
                ]}
                required
              />
            </div>
          </Section>
        </div>

        {/* Right col — 1/3 width */}
        <div>
          <Section title="Media Gallery" icon={ImageIcon}>
            {/* Drop zone */}
            <div
              className={`upload-zone flex flex-col items-center justify-center p-8 mb-5 ${
                isDragging ? "dragging" : ""
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*"
                onChange={(e) =>
                  e.target.files && handleFiles(e.target.files)
                }
              />
              <UploadCloud
                size={28}
                style={{ color: "#F5B301", marginBottom: "10px" }}
              />
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#374151",
                  textAlign: "center",
                  marginBottom: "4px",
                }}
              >
                Drag & Drop Images
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  color: "#94A3B8",
                  textAlign: "center",
                }}
              >
                First image = main product photo
              </p>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group"
                    style={{
                      aspectRatio: "1",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid #EAECEF",
                    }}
                  >
                    <img
                      src={src}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                    {idx === 0 && (
                      <div
                        className="absolute top-1 left-1"
                        style={{
                          background: "#F5B301",
                          borderRadius: "5px",
                          padding: "2px 5px",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "8px",
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        MAIN
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        background: "#EF4444",
                        color: "#ffffff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Publish hint card */}
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #86EFAC",
              borderRadius: "20px",
              padding: "20px",
            }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} style={{ color: "#16A34A", flexShrink: 0, marginTop: "1px" }} />
              <div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#15803D",
                    marginBottom: "4px",
                  }}
                >
                  Ready to Publish
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    color: "#4ADE80",
                    color: "#16A34A",
                    opacity: 0.8,
                  }}
                >
                  Listings will go live globally as soon as you hit "Publish Product".
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AddProduct;
