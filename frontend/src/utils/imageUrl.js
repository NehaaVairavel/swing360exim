const API_URL = import.meta.env.VITE_API_URL || 'https://swing360exim-backend.ryqbsj.easypanel.host/api';
// Remove /api from the end to get the base domain
const API_BASE = API_URL.replace(/\/api$/, '');

export const getImageUrl = (image) => {
  if (!image) return null;
  
  // If it's already an absolute URL with http or https, return as is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // If it's a relative URL starting with '/', just prepend API_BASE
  if (image.startsWith('/')) {
    return `${API_BASE}${image}`;
  }
  
  // If it's a relative URL like 'uploads/...', prepend API_BASE/
  return `${API_BASE}/${image}`;
};
