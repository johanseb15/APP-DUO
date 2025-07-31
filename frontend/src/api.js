import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = {
  // Menu Item Management
  getMenuItems: async () => {
    const response = await axios.get(`${API}/menu`);
    return response.data;
  },
  createProduct: async (data) => {
    const response = await axios.post(`${API}/admin/menu`, data);
    return response.data;
  },
  updateProduct: async (id, data) => {
    const response = await axios.put(`${API}/admin/menu/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id) => {
    await axios.delete(`${API}/admin/menu/${id}`);
  },

  // Order Management
  getOrders: async (status = '') => {
    const response = await axios.get(`${API}/admin/orders${status ? `?status=${status}` : ''}`);
    return response.data;
  },
  updateOrderStatus: async (orderId, status) => {
    await axios.put(`${API}/admin/orders/${orderId}/status`, { status });
  },

  // Category Management (assuming these exist in your backend)
  getCategories: async () => {
    const response = await axios.get(`${API}/categories`);
    return response.data;
  },
  createCategory: async (data) => {
    const response = await axios.post(`${API}/admin/categories`, data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await axios.put(`${API}/admin/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    await axios.delete(`${API}/admin/categories/${id}`);
  },

  // Delivery Zone Management
  getDeliveryZones: async () => {
    const response = await axios.get(`${API}/delivery-zones`);
    return response.data;
  },
  createDeliveryZone: async (data) => {
    const response = await axios.post(`${API}/admin/delivery-zones`, data);
    return response.data;
  },
  updateDeliveryZone: async (id, data) => {
    const response = await axios.put(`${API}/admin/delivery-zones/${id}`, data);
    return response.data;
  },
  deleteDeliveryZone: async (id) => {
    await axios.delete(`${API}/admin/delivery-zones/${id}`);
  },

  // Push Notification Management
  getSentNotifications: async () => {
    const response = await axios.get(`${API}/admin/push/notifications`);
    return response.data;
  },
  sendPushNotification: async (data) => {
    await axios.post(`${API}/admin/push/send`, data);
  },

  // Authentication
  adminLogin: async (email, password) => {
    const response = await axios.post(`${API}/admin/login`, { email, password });
    return response.data;
  },
  adminMe: async () => {
    const response = await axios.get(`${API}/admin/me`);
    return response.data;
  },

  // Data Initialization
  initializeData: async () => {
    await axios.post(`${API}/initialize-data`);
  },
};

export default api;