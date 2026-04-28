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
  FileText
} from "lucide-react";
import { toast } from "sonner";

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 mb-8 hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
      <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
        <Icon size={20} />
      </div>
      <h3 className="text-xl font-display font-bold text-[#0F172A]">{title}</h3>
    </div>
    {children}
  </div>
);

const Input = ({ label, required, ...props }) => (
  <div className="mb-6">
    <label className="block text-sm font-bold text-slate-700 mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input 
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm text-slate-700 placeholder:text-slate-400" 
      {...props} 
    />
  </div>
);

const Select = ({ label, required, options, ...props }) => (
  <div className="mb-6">
    <label className="block text-sm font-bold text-slate-700 mb-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <select 
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat" 
      {...props}
    >
      <option value="">Select {label}</option>
      {options && Array.isArray(options) && options.filter(Boolean).map(opt => (
          <option key={opt?.id || opt} value={opt?.id || opt}>{opt?.name || opt}</option>
      ))}
    </select>
  </div>
);

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
    category: "",
    condition: "Used",
    price: "",
    currency: "USD",
    engine_hours: "",
    availability: "",
    location: "Dubai, UAE",
    full_description: ""
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        setCategories((Array.isArray(categoriesData) ? categoriesData : []).filter(Boolean));
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    const newUrls = newFiles.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newUrls]);
    toast.success(`${files.length} images added to gallery`);
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["name", "category", "engine_hours", "location", "availability", "price", "currency"];
    const missingFields = requiredFields.filter(f => !formData[f]);

    if (missingFields.length > 0) {
        return toast.error(`Please fill in required fields: ${missingFields.map(f => f.replace('_', ' ')).join(", ")}`);
    }

    if (imageFiles.length === 0) {
        return toast.error("Main Image is required. Please upload at least one image.");
    }

    setSubmitting(true);
    
    try {
      // 1. Upload actual files first if any
      let finalImageUrls = [];
      if (imageFiles.length > 0) {
        toast.info(`Uploading ${imageFiles.length} images...`);
        const uploadRes = await productService.uploadImages(imageFiles);
        finalImageUrls = uploadRes.urls || [];
      }

      // 2. Prepare payload with permanent R2 keys (not blobs)
      const payload = {
        ...formData,
        images: finalImageUrls, 
        image: finalImageUrls.length > 0 ? finalImageUrls[0] : null,
      };

      await productService.create(payload);
      // Invalidate queries to refresh data instantly
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["featuredProducts"] });
      
      toast.success("Equipment published with permanent image storage!");
      navigate("/admin/products");
    } catch (error) {
      const msg = error?.response?.data?.error || "Failed to publish product";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto pb-24">
      <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md py-6 mb-8 border-b border-slate-200 -mx-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-amber-500 hover:border-amber-200 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-[#0F172A] tracking-tight">Add New Equipment</h1>
            <p className="text-slate-500 text-sm font-medium">Create a premium listing for the global market</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            disabled={submitting}
            onClick={handleSubmit}
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={18} />
            <span>{submitting ? "Publishing..." : "Publish Product"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section title="Basic Information" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Input label="Product Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Caterpillar 320 GC" required />
              <Select label="Category" name="category" value={formData.category} onChange={handleInputChange} options={categories} required />
              <Input label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="Caterpillar" required />
              <Input label="Model Number" name="model" value={formData.model} onChange={handleInputChange} placeholder="320 GC" required />
              <Select label="Condition" name="condition" value={formData.condition} onChange={handleInputChange} options={["New", "Used", "Refurbished"]} required />
              <Input label="Engine Hours" name="engine_hours" value={formData.engine_hours} onChange={handleInputChange} type="number" placeholder="e.g. 1200" required />
              <Input label="Location" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Dubai, UAE" required />
              <Select label="Availability" name="availability" value={formData.availability} onChange={handleInputChange} options={[{id:"in_stock", name:"In Stock"}, {id:"sold", name:"Sold"}, {id:"coming_soon", name:"Coming Soon"}]} required />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Description <span className="text-rose-500">*</span></label>
              <textarea 
                name="full_description"
                value={formData.full_description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm h-32"
                placeholder="Describe the machine's features, history, and technical condition..."
                required
              />
            </div>
          </Section>

          <Section title="Pricing & Availability" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Input label="Price" name="price" value={formData.price} onChange={handleInputChange} type="text" placeholder="e.g. $125,000" required />
              <Select label="Currency" name="currency" value={formData.currency} onChange={handleInputChange} options={[{id:"INR", name:"INR ₹"}, {id:"USD", name:"USD $"}, {id:"AED", name:"AED د.إ"}, {id:"EUR", name:"EUR €"}]} required />
            </div>
          </Section>
        </div>

        <div className="space-y-8">
          <Section title="Media Gallery" icon={ImageIcon}>
            <div 
              className={`w-full border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center cursor-pointer ${
                isDragging ? "border-amber-500 bg-amber-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
            >
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              <UploadCloud size={32} className="text-amber-500 mb-3" />
              <p className="text-xs font-bold text-slate-800 text-center">Drag & Drop Images</p>
              <p className="text-[10px] text-slate-400 mt-2 text-center">First image will be the Main Product Image</p>
            </div>
            
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {images.map((src, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </form>
    </div>
  );
};
export default AddProduct;
