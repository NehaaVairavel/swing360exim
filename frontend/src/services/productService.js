import api from '../api/api';

const FALLBACK_CATEGORIES = [
  "Excavators", "Backhoe Loaders", "Dozers", "Wheel Loaders",
  "Graders", "Rollers", "Skid Steer", "Buckets", "Material Handlers", "Others"
];

const productService = {
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Creates a product — sends JSON (images as URLs from R2 upload)
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Uploads raw file objects to R2 via backend
  uploadImages: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // returns { urls: [...] }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return Array.isArray(response.data) && response.data.length > 0
        ? response.data
        : FALLBACK_CATEGORIES;
    } catch {
      return FALLBACK_CATEGORIES;
    }
  }
};

export default productService;
