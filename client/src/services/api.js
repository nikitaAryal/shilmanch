import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor - Add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  getMe: () => api.get('/auth/me'),
};

// Plays API
export const playsAPI = {
  getAll: () => api.get('/plays'),
  getActive: () => api.get('/active_play'),
  getById: (id) => api.get(`/play/${id}`),
  create: (data) => api.post('/createplay', data),
  update: (id, data) => api.patch(`/play/${id}`, data),
  delete: (id) => api.delete(`/play/${id}`),
};

// Active Plays API
export const activePlayAPI = {
  getAll: () => api.get('/active_play'),
  getById: (id) => api.get(`/active_play/${id}`),
  create: (data) => api.post('/createacplay', data),
  update: (id, data) => api.patch(`/active_play/${id}`, data),
  delete: (id) => api.delete(`/active_play/${id}`),
};

// Bookings API
export const bookingAPI = {
  create: (data) => api.post('/booking', data),
  getAll: () => api.get('/bookingrw'),
  getById: (id) => api.get(`/bookingrs/${id}`),
  getBookedSeats: (activePlayId) => api.get(`/booking/active/${activePlayId}`),
  update: (id, data) => api.patch(`/booking/${id}`, data),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
  getById: (id) => api.get(`/orders/${id}`),
  update: (id, data) => api.patch(`/orders/${id}`, data),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/user/${id}`),
  update: (id, data) => api.patch(`/user/${id}`, data),
  delete: (id) => api.delete(`/user/${id}`),
};

// Payments API
export const paymentsAPI = {
  create: (data) => api.post('/payments', data),
  getById: (id) => api.get(`/payments/${id}`),
  update: (id, data) => api.patch(`/payments/${id}`, data),
};
