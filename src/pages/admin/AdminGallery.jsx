import { useState, useRef, useEffect } from "react";
import galleryService from "@/services/galleryService";
import { 
  Search, 
  Trash2, 
  Eye, 
  UploadCloud, 
  Image as ImageIcon, 
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";

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

  const filteredMedia = images.filter(img => {
    const matchesCategory = activeCategory === "All" || img.category === activeCategory;
    const matchesSearch = (img.image_url || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (img.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await galleryService.delete(id);
      setImages(prev => prev.filter(img => img.id !== id));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleUpload = async (files) => {
    const file = files[0]; // Assuming single upload for now or iterate
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", activeCategory === "All" ? "Others" : activeCategory);

    try {
      await galleryService.upload(formData);
      const freshData = await galleryService.getAll();
      setImages(freshData);
      toast.success("Image uploaded to gallery");
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold">Accessing Media Vault...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#0F172A] tracking-tight">Media Assets</h1>
          <p className="text-slate-500 font-medium mt-1">Manage brand imagery and operational photos</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg group"
        >
          <UploadCloud size={20} className="group-hover:scale-110 transition-transform" />
          <span>Upload New Asset</span>
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
      </div>

      <div 
        className={`w-full border-2 border-dashed rounded-[2rem] p-12 transition-all flex flex-col items-center justify-center cursor-pointer mb-8 ${
          isDragging ? "border-amber-500 bg-amber-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files) handleUpload(e.dataTransfer.files); }}
      >
        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
          <ImageIcon size={32} />
        </div>
        <h3 className="text-xl font-display font-bold text-[#0F172A] mb-2">Drop your imagery here</h3>
        <p className="text-slate-500 text-sm max-w-xs text-center">We support high-resolution machinery and site photography</p>
      </div>

      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto">
          {['All', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? "bg-white text-[#0F172A] shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMedia.map((media) => (
          <div key={media.id} className="group relative bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
            <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
              <img src={media.image_url} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                <button className="p-4 bg-white rounded-2xl text-[#0F172A] hover:bg-amber-500 transition-all"><Eye size={20} /></button>
                <button 
                  onClick={() => handleDelete(media.id)}
                  className="p-4 bg-white rounded-2xl text-[#0F172A] hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-[#0F172A] text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                  {media.category}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="font-display font-bold text-slate-900 truncate">Machine_{media.id}.jpg</h4>
            </div>
          </div>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-full p-24 flex flex-col items-center justify-center text-slate-500 bg-white rounded-[2rem] border border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FolderOpen size={32} className="text-slate-300" />
            </div>
            <p className="text-xl font-display font-bold text-[#0F172A]">No media assets found</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminGallery;
