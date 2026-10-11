import api from './client';

// ==================== AUTH ====================
export const authApi = {
  login: async (email, password) => {
    // FastAPI OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const res = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  },
  register: async (data) => {
    // data: { name, email, password, role, college_id }
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// ==================== COLLEGES ====================
export const collegesApi = {
  getAll: async (city = '') => {
    const res = await api.get('/colleges', { params: city ? { city } : {} });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/colleges/${id}`);
    return res.data;
  },
  create: async (data) => {
    // data: { name, city, address, is_central }
    const res = await api.post('/colleges', data);
    return res.data;
  },
};

// ==================== AMENITIES ====================
export const amenitiesApi = {
  getAll: async (category = '') => {
    const res = await api.get('/amenities', { params: category ? { category } : {} });
    return res.data;
  },
  create: async (data) => {
    // data: { name, category: "hostel" | "mess" | "cafeteria" }
    const res = await api.post('/amenities', data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/amenities/${id}`);
    return res.data;
  },
};

// ==================== HOSTELS ====================
export const hostelsApi = {
  getAll: async (params = {}) => {
    // params: { college_id, city, location, gender, max_rent, amenity (array/repeated), sort }
    const res = await api.get('/hostels', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/hostels/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/hostels', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/hostels/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/hostels/${id}`);
    return res.data;
  },
};

// ==================== MESSES ====================
export const messesApi = {
  getAll: async (params = {}) => {
    // params: { college_id, city, location, food_type, max_price, amenity, sort }
    const res = await api.get('/messes', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/messes/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/messes', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/messes/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/messes/${id}`);
    return res.data;
  },
};

// ==================== CAFETERIAS ====================
export const cafeteriasApi = {
  getAll: async (params = {}) => {
    // params: { college_id, city, location, food_type, max_meal_price, home_delivery, amenity, sort }
    const res = await api.get('/cafeterias', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/cafeterias/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/cafeterias', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/cafeterias/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/cafeterias/${id}`);
    return res.data;
  },
};

// ==================== COMPARE & ANALYTICS ====================
export const compareApi = {
  compareHostels: async (ids) => {
    // ids: array or comma-separated string
    const idStr = Array.isArray(ids) ? ids.join(',') : ids;
    const res = await api.get('/compare/hostels', { params: { ids: idStr } });
    return res.data;
  },
  compareMesses: async (ids) => {
    const idStr = Array.isArray(ids) ? ids.join(',') : ids;
    const res = await api.get('/compare/messes', { params: { ids: idStr } });
    return res.data;
  },
  compareCafeterias: async (ids) => {
    const idStr = Array.isArray(ids) ? ids.join(',') : ids;
    const res = await api.get('/compare/cafeterias', { params: { ids: idStr } });
    return res.data;
  },
  compareColleges: async (ids) => {
    const idStr = Array.isArray(ids) ? ids.join(',') : ids;
    const res = await api.get('/compare/colleges', { params: { ids: idStr } });
    return res.data;
  },
  getCollegePrices: async (collegeId) => {
    const res = await api.get(`/compare/prices/${collegeId}`);
    return res.data;
  },
  getCityOverview: async (city) => {
    const res = await api.get('/compare/city-overview', { params: { city } });
    return res.data;
  },
};

// ==================== ADMISSIONS ====================
export const admissionsApi = {
  apply: async (hostelId) => {
    const res = await api.post('/admissions', { hostel_id: hostelId });
    return res.data;
  },
  getAll: async (params = {}) => {
    // params: { status, hostel_id }
    const res = await api.get('/admissions', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/admissions/${id}`);
    return res.data;
  },
  uploadDocument: async (applicationId, docType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.put(`/admissions/${applicationId}/documents/${docType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  downloadDocumentUrl: (applicationId, docType) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${base}/admissions/${applicationId}/documents/${docType}`;
  },
  fetchDocumentBlob: async (applicationId, docType) => {
    const res = await api.get(`/admissions/${applicationId}/documents/${docType}`, {
      responseType: 'blob',
    });
    return res.data;
  },
  submit: async (applicationId) => {
    const res = await api.post(`/admissions/${applicationId}/submit`);
    return res.data;
  },
  review: async (applicationId, approve, reason = null) => {
    const res = await api.post(`/admissions/${applicationId}/review`, {
      approve,
      reason,
    });
    return res.data;
  },
};

// ==================== PAYMENTS ====================
export const paymentsApi = {
  create: async (data) => {
    // data: { kind: 'hostel_rent'|'mess_fee', hostel_id, mess_id, months, include_deposit }
    const res = await api.post('/payments', data);
    return res.data;
  },
  confirm: async (paymentId, providerPaymentId, success = true) => {
    const res = await api.post(`/payments/${paymentId}/confirm`, {
      provider_payment_id: providerPaymentId,
      success,
    });
    return res.data;
  },
  getMyPayments: async () => {
    const res = await api.get('/payments');
    return res.data;
  },
};

// ==================== POSTS / FEED ====================
export const postsApi = {
  getFeed: async (params = {}) => {
    // params: { college_id, kind, post_date }
    const res = await api.get('/posts', { params });
    return res.data;
  },
  getToday: async () => {
    const res = await api.get('/posts/today');
    return res.data;
  },
  create: async (data) => {
    // data: { college_id, kind, mess_id, hostel_id, cafeteria_id, title, body, image_url, post_date }
    const res = await api.post('/posts', data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
};

// ==================== REVIEWS ====================
export const reviewsApi = {
  getByTarget: async (targetType, targetId) => {
    // targetType: 'hostel' | 'mess' | 'cafeteria'
    const res = await api.get('/reviews', {
      params: { target_type: targetType, target_id: targetId },
    });
    return res.data;
  },
  create: async (data) => {
    // data: { target_type, target_id, rating, comment }
    const res = await api.post('/reviews', data);
    return res.data;
  },
};

// ==================== IMAGES ====================
export const imagesApi = {
  upload: async (file, folder = 'misc') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res = await api.post('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data; // { url, public_id, width, height, format }
  },
  delete: async (publicId) => {
    const res = await api.delete('/images', { params: { public_id: publicId } });
    return res.data;
  },
};
