import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set authorization header for authenticated requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- Auth Endpoints ---
export const login = (username, password, restaurantSlug) =>
  api.post('/auth/login', { username, password, restaurant_slug: restaurantSlug });

export const refreshToken = (refreshToken) =>
  api.post('/auth/refresh', { refresh_token: refreshToken });

// --- Restaurant Endpoints ---
export const getRestaurantBySlug = (slug) => api.get(`/api/restaurants/${slug}`);
export const updateRestaurant = (slug, data) => api.put(`/api/restaurants/${slug}`, data);

// --- Category Endpoints ---
export const getCategories = (slug) => api.get(`/api/${slug}/categories`);
export const createCategory = (slug, data) => api.post(`/api/${slug}/categories`, data);
export const updateCategory = (slug, categoryId, data) => api.put(`/api/${slug}/categories/${categoryId}`, data);
export const deleteCategory = (slug, categoryId) => api.delete(`/api/${slug}/categories/${categoryId}`);

// --- Product Endpoints ---
export const getProducts = (slug, params) => api.get(`/api/${slug}/products`, { params });
export const getProductById = (slug, productId) => api.get(`/api/${slug}/products/${productId}`);
export const createProduct = (slug, data) => api.post(`/api/${slug}/products`, data);
export const updateProduct = (slug, productId, data) => api.put(`/api/${slug}/products/${productId}`, data);
export const deleteProduct = (slug, productId) => api.delete(`/api/${slug}/products/${productId}`);

// --- Order Endpoints ---
export const createOrder = (slug, data) => api.post(`/api/${slug}/orders`, data);
export const getOrders = (slug, params) => api.get(`/api/${slug}/orders`, { params });
export const getOrderById = (slug, orderId) => api.get(`/api/${slug}/orders/${orderId}`);
export const updateOrderStatus = (slug, orderId, status) => api.put(`/api/${slug}/orders/${orderId}/status`, { status });

// --- Analytics Endpoints ---
export const getDashboardAnalytics = (slug) => api.get(`/api/${slug}/analytics/dashboard`);

// --- Push Notification Endpoints ---
export const subscribePush = (data) => api.post('/push/subscribe', data);
export const sendPushNotification = (data) => api.post('/admin/push/send', data);
export const getSentNotifications = () => api.get('/admin/push/notifications');

// --- Superadmin Endpoints ---
export const createRestaurant = (data) => api.post('/superadmin/restaurants', data);
export const getAllRestaurants = () => api.get('/superadmin/restaurants');

export default api;
