import api from '../api/api';

const galleryService = {
  getAll: async () => {
    const response = await api.get('/gallery');
    return response.data;
  },
  
  upload: async (formData) => {
    const response = await api.post('/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/gallery/${id}`);
    return response.data;
  }
};

export default galleryService;
