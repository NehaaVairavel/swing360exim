import { useState, useRef, useEffect } from "react";
import galleryService from "@/services/galleryService";
import {
  Search,
  Trash2,
  Eye,
  UploadCloud,
  Image as ImageIcon,
  FolderOpen,
  Grid,
} from "lucide-react";
import { toast } from "sonner";
import "@/styles/admin.css";

const categories = ["Shipping", "Logistics", "Workshop", "Events", "Others"];

const AdminGallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await galleryService.getAll();
        setImages(data);
      } catch (error) {
        toast.error("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredMedia = images.filter((img) => {
    const matchesCategory =
      activeCategory === "All" || img.category === activeCategory;
    const matchesSearch =
      (img.image_url || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await galleryService.delete(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleUpload = async (files) => {
    const file = files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append(
      "category",
      activeCategory === "All" ? "Others" : activeCategory
    );
    try {
      await galleryService.upload(formData);
      const freshData = await galleryService.getAll();
      setImages(freshData);
      toast.success("Image uploaded to gallery");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  if (loading)
    return (
      <div className="admin-loading">
        <span>Loading Media Vault...</span>
      </div>
    );

  return (
    <div style={{ animation: "fadeIn 0.5s ease", paddingBottom: "48px" }}>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Media Assets</h1>
          <p className="admin-page-subtitle">
            Manage brand imagery and operational photos
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary"
        >
          <UploadCloud size={17} />
          Upload New Asset
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      {/* ── Upload Drop Zone ── */}
      <div
        className={`upload-zone flex flex-col items-center justify-center p-12 mb-7 ${
          isDragging ? "dragging" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "#FEF9EC",
            color: "#F5B301",
          }}
        >
          <UploadCloud size={28} />
        </div>
        <h3
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 700,
            fontSize: "17px",
            color: "#111827",
            marginBottom: "6px",
          }}
        >
          Drop your imagery here
        </h3>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            color: "#64748B",
            textAlign: "center",
            maxWidth: "300px",
          }}
        >
          We support high-resolution machinery and site photography. Click or
          drag files to upload.
        </p>
      </div>

      {/* ── Category Filter + Search ── */}
      <div
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-7"
        style={{
          background: "#ffffff",
          border: "1px solid #EAECEF",
          borderRadius: "22px",
          padding: "16px 20px",
          boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        }}
      >
        {/* Category tabs */}
        <div
          className="flex p-1 overflow-x-auto"
          style={{
            background: "#F1F3F7",
            borderRadius: "14px",
            gap: "2px",
          }}
        >
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.2s ease",
                background: activeCategory === cat ? "#ffffff" : "transparent",
                color: activeCategory === cat ? "#111827" : "#64748B",
                boxShadow:
                  activeCategory === cat
                    ? "0 2px 8px rgba(15,23,42,0.08)"
                    : "none",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div
          className="relative"
          style={{ width: "100%", maxWidth: "300px" }}
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size={15}
            style={{ color: "#94A3B8" }}
          />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: "40px" }}
          />
        </div>
      </div>

      {/* ── Image Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredMedia.map((media) => (
          <div
            key={media.id}
            className="group overflow-hidden"
            style={{
              background: "#ffffff",
              border: "1px solid #EAECEF",
              borderRadius: "22px",
              boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 18px 40px rgba(15,23,42,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px rgba(15,23,42,0.05)";
            }}
          >
            {/* Image */}
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "4/5", background: "#F1F3F7" }}
            >
              <img
                src={media.image_url}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.8s ease",
                }}
                className="group-hover:scale-105"
              />

              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3"
                style={{ background: "rgba(17,24,39,0.55)" }}
              >
                <button
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    color: "#111827",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F5B301";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleDelete(media.id)}
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    color: "#111827",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#EF4444";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.color = "#111827";
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Category badge */}
              <div
                className="absolute top-4 left-4"
              >
                <span
                  className="admin-label-small"
                  style={{
                    background: "#ffffff",
                    color: "#374151",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    fontSize: "9px",
                    boxShadow: "0 2px 8px rgba(15,23,42,0.1)",
                  }}
                >
                  {media.category}
                </span>
              </div>
            </div>

            {/* Caption */}
            <div
              className="px-5 py-4"
              style={{ borderTop: "1px solid #F1F3F7" }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "13px",
                  color: "#374151",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Asset_{media.id}.jpg
              </p>
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredMedia.length === 0 && (
          <div
            className="col-span-full admin-empty-state"
            style={{ gridColumn: "1 / -1" }}
          >
            <div className="admin-empty-icon">
              <FolderOpen size={28} />
            </div>
            <p
              style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: "18px",
                color: "#111827",
                marginBottom: "6px",
              }}
            >
              No media assets found
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                color: "#64748B",
              }}
            >
              Upload your first asset using the button above
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminGallery;
