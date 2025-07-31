import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

// Cart Context
const CartContext = React.createContext();

// Auth Provider
const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API}/admin/me`);
      setAdmin(response.data);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/admin/login`, { email, password });
      const { access_token, admin: adminData } = response.data;
      
      setToken(access_token);
      setAdmin(adminData);
      localStorage.setItem('adminToken', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Cart Provider
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [deliveryZone, setDeliveryZone] = useState(null);

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menu_item_id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, {
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          special_instructions: ""
        }];
      }
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart(prevCart => prevCart.filter(item => item.menu_item_id !== menuItemId));
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity === 0) {
      removeFromCart(menuItemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.menu_item_id === menuItemId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      deliveryZone,
      setDeliveryZone,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Push Notification Service
const PushNotificationService = {
  async requestPermission() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  async subscribeUser() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa40HI80L2L5ZsR7Vs')
      });

      await axios.post(`${API}/push/subscribe`, {
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
        userAgent: navigator.userAgent
      });

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  },

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};

// Admin Login Component
const AdminLogin = () => {
  const { login } = React.useContext(AuthContext);
  const [email, setEmail] = useState('admin@duoprevia.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            DUO Previa Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingrese sus credenciales de administrador
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Admin Dashboard Components
const AdminSidebar = ({ activeSection, setActiveSection, onLogout }) => {
  const menuItems = [
    { id: 'menu', name: 'Menú', icon: '🍽️' },
    { id: 'orders', name: 'Pedidos', icon: '📋' },
    { id: 'zones', name: 'Zonas', icon: '📍' },
    { id: 'notifications', name: 'Notificaciones', icon: '🔔' }
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-red-400">DUO Previa Admin</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-colors ${
              activeSection === item.id 
                ? 'bg-red-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={onLogout}
          className="w-full p-3 text-left text-gray-300 hover:bg-gray-700 rounded-lg flex items-center space-x-3"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

// Menu Management Component
const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'lomitos',
    image_url: '',
    available: true
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API}/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API}/admin/menu/${editingItem.id}`, formData);
      } else {
        await axios.post(`${API}/admin/menu`, formData);
      }
      fetchMenuItems();
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image_url: item.image_url,
      available: item.available
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await axios.delete(`${API}/admin/menu/${itemId}`);
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'lomitos',
      image_url: '',
      available: true
    });
    setEditingItem(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Menú</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancelar' : 'Agregar Producto'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  <option value="lomitos">Lomitos</option>
                  <option value="hamburgers">Hamburguesas</option>
                  <option value="empanadas">Empanadas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({...formData, available: e.target.checked})}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                Disponible
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                {editingItem ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.available ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              <p className="text-red-600 font-bold mb-3">${item.price.toLocaleString()}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Order Management Component
const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders${filterStatus ? `?status=${filterStatus}` : ''}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Pedidos</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmados</option>
          <option value="preparing">En preparación</option>
          <option value="delivered">Entregados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">Pedido #{order.id.substr(-8)}</h3>
                <p className="text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Cliente</h4>
                <p className="text-gray-600">{order.customer_name}</p>
                <p className="text-gray-600">{order.customer_phone}</p>
                <p className="text-gray-600">{order.delivery_address}</p>
                <p className="text-gray-600">Zona: {order.delivery_zone}</p>
                {order.special_instructions && (
                  <p className="text-gray-600 mt-2">
                    <strong>Instrucciones:</strong> {order.special_instructions}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Productos</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-semibold flex justify-between">
                    <span>Total:</span>
                    <span>${order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="preparing">Preparando</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay pedidos disponibles</p>
        </div>
      )}
    </div>
  );
};

// Delivery Zone Management Component
const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    delivery_fee: '',
    estimated_time: '',
    active: true
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await axios.get(`${API}/delivery-zones`);
      setZones(response.data);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingZone) {
        await axios.put(`${API}/admin/delivery-zones/${editingZone.id}`, formData);
      } else {
        await axios.post(`${API}/admin/delivery-zones`, formData);
      }
      fetchZones();
      resetForm();
    } catch (error) {
      console.error('Error saving delivery zone:', error);
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      delivery_fee: zone.delivery_fee.toString(),
      estimated_time: zone.estimated_time,
      active: zone.active
    });
    setShowForm(true);
  };

  const handleDelete = async (zoneId) => {
    if (window.confirm('¿Está seguro de eliminar esta zona?')) {
      try {
        await axios.delete(`${API}/admin/delivery-zones/${zoneId}`);
        fetchZones();
      } catch (error) {
        console.error('Error deleting delivery zone:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      delivery_fee: '',
      estimated_time: '',
      active: true
    });
    setEditingZone(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Zonas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? 'Cancelar' : 'Nueva Zona'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingZone ? 'Editar Zona' : 'Nueva Zona'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo de Envío
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.delivery_fee}
                  onChange={(e) => setFormData({...formData, delivery_fee: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo Estimado
                </label>
                <input
                  type="text"
                  value={formData.estimated_time}
                  onChange={(e) => setFormData({...formData, estimated_time: e.target.value})}
                  placeholder="30-45 min"
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Activa
              </label>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                {editingZone ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map(zone => (
          <div key={zone.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{zone.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                zone.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {zone.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <p className="text-gray-600 mb-2">Envío: ${zone.delivery_fee.toLocaleString()}</p>
            <p className="text-gray-600 mb-4">Tiempo: {zone.estimated_time}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(zone)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(zone.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Push Notification Management Component
const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    icon: '',
    url: ''
  });

  useEffect(() => {
    fetchNotifications();
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/admin/push/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/push/send`, formData);
      setFormData({ title: '', body: '', icon: '', url: '' });
      fetchNotifications();
      alert('Notificación enviada exitosamente');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error al enviar notificación');
    }
  };

  const presetNotifications = [
    {
      title: '¡Ya estamos abiertos! 🎉',
      body: 'DUO Previa está disponible para pedidos. ¡Ordena tus lomitos favoritos!'
    },
    {
      title: '¡Promo del día disponible! 🍔',
      body: '20% de descuento en hamburguesas DUO. ¡Solo por hoy!'
    },
    {
      title: '¡Nuevas empanadas! 🥟',
      body: 'Descubre nuestras empanadas de pollo y verdura. ¡Deliciosas!'
    }
  ];

  const usePreset = (preset) => {
    setFormData({
      ...formData,
      title: preset.title,
      body: preset.body
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Notificaciones</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Enviar Notificación</h3>
        
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2">Plantillas rápidas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {presetNotifications.map((preset, index) => (
              <button
                key={index}
                onClick={() => usePreset(preset)}
                className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-sm">{preset.title}</div>
                <div className="text-gray-600 text-xs mt-1">{preset.body.substring(0, 50)}...</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendNotification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icono (URL)
              </label>
              <input
                type="url"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enlace (URL)
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            Enviar Notificación
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Historial de Notificaciones</h3>
          <div className="space-y-4">
            {notifications.map(notification => (
              <div key={notification.id} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-gray-600 text-sm">{notification.body}</p>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(notification.sent_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {notifications.length === 0 && (
            <p className="text-gray-500 text-center py-8">No hay notificaciones enviadas</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Main Component
const AdminDashboard = () => {
  const { logout } = React.useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('menu');

  const renderSection = () => {
    switch (activeSection) {
      case 'menu':
        return <MenuManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'zones':
        return <ZoneManagement />;
      case 'notifications':
        return <NotificationManagement />;
      default:
        return <MenuManagement />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={logout}
      />
      <div className="flex-1 overflow-x-hidden">
        {renderSection()}
      </div>
    </div>
  );
};

// Header Component (Customer App)
const Header = () => {
  const { getCartItemCount } = React.useContext(CartContext);
  const [showCart, setShowCart] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported and user hasn't been asked
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const hasAskedForNotifications = localStorage.getItem('hasAskedForNotifications');
      if (!hasAskedForNotifications) {
        setShowNotificationPrompt(true);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await PushNotificationService.requestPermission();
    if (granted) {
      await PushNotificationService.subscribeUser();
      alert('¡Notificaciones activadas! Te avisaremos de promociones y novedades.');
    }
    localStorage.setItem('hasAskedForNotifications', 'true');
    setShowNotificationPrompt(false);
  };

  const handleDismissNotifications = () => {
    localStorage.setItem('hasAskedForNotifications', 'true');
    setShowNotificationPrompt(false);
  };

  return (
    <>
      <header className="bg-red-600 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">DUO Previa</h1>
            <p className="text-sm opacity-90">Córdoba - Lomitos & Más</p>
          </div>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
          >
            🛒 Carrito
            {getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {getCartItemCount()}
              </span>
            )}
          </button>
        </div>
        {showCart && <Cart onClose={() => setShowCart(false)} />}
      </header>

      {showNotificationPrompt && (
        <div className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex-1">
              <p className="font-medium">🔔 ¿Quieres recibir notificaciones de ofertas especiales?</p>
              <p className="text-sm opacity-90">Te avisaremos cuando tengamos promociones y cuando abramos.</p>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={handleEnableNotifications}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg text-sm"
              >
                Sí, activar
              </button>
              <button
                onClick={handleDismissNotifications}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm"
              >
                No, gracias
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Menu Item Component (Customer App)
const MenuItem = ({ item }) => {
  const { addToCart } = React.useContext(CartContext);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={item.image_url}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-600 text-sm mt-1 mb-3">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-red-600">
            ${item.price.toLocaleString()}
          </span>
          <button
            onClick={() => addToCart(item)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

// Menu Categories Component (Customer App)
const MenuCategories = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { id: 'all', name: 'Todo', icon: '🍽️' },
    { id: 'lomitos', name: 'Lomitos', icon: '🥪' },
    { id: 'hamburgers', name: 'Hamburguesas', icon: '🍔' },
    { id: 'empanadas', name: 'Empanadas', icon: '🥟' }
  ];

  return (
    <div className="flex overflow-x-auto pb-2 mb-6 space-x-4">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            activeCategory === category.id
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
};

// Cart Component (Customer App)
const Cart = ({ onClose }) => {
  const { cart, deliveryZone, setDeliveryZone, updateQuantity, removeFromCart, getCartTotal, clearCart } = React.useContext(CartContext);
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    instructions: ''
  });
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchDeliveryZones();
  }, []);

  const fetchDeliveryZones = async () => {
    try {
      const response = await axios.get(`${API}/delivery-zones`);
      setDeliveryZones(response.data);
      if (response.data.length > 0 && !deliveryZone) {
        setDeliveryZone(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
    }
  };

  const generateWhatsAppMessage = () => {
    const orderDetails = cart.map(item => 
      `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');
    
    const subtotal = getCartTotal();
    const deliveryFee = deliveryZone ? deliveryZone.delivery_fee : 0;
    const total = subtotal + deliveryFee;

    const message = `🍔 *PEDIDO DUO PREVIA* 🍔

📋 *DETALLE DEL PEDIDO:*
${orderDetails}

💰 *RESUMEN:*
Subtotal: $${subtotal.toLocaleString()}
Envío (${deliveryZone?.name}): $${deliveryFee.toLocaleString()}
*TOTAL: $${total.toLocaleString()}*

👤 *DATOS DEL CLIENTE:*
Nombre: ${customerInfo.name}
Teléfono: ${customerInfo.phone}
Zona: ${deliveryZone?.name}
Dirección: ${customerInfo.address}
${customerInfo.instructions ? `Instrucciones: ${customerInfo.instructions}` : ''}

⏰ Tiempo estimado: ${deliveryZone?.estimated_time}

¡Gracias por elegir DUO Previa! 🙌`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert('Por favor complete todos los datos requeridos');
      return;
    }

    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/5493512345678?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after order
    clearCart();
    onClose();
  };

  if (cart.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Carrito</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">Tu carrito está vacío</p>
            <p className="text-sm text-gray-400 mt-2">¡Agrega algunos productos deliciosos!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Carrito ({cart.length} productos)</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
              ✕
            </button>
          </div>

          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.menu_item_id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toLocaleString()} c/u</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 w-8 h-8 rounded-full"
                    >
                      -
                    </button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                      className="bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-red-600 min-w-[80px] text-right">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.menu_item_id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Zone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona de envío
            </label>
            <select
              value={deliveryZone?.id || ''}
              onChange={(e) => {
                const zone = deliveryZones.find(z => z.id === e.target.value);
                setDeliveryZone(zone);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            >
              {deliveryZones.map(zone => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} - ${zone.delivery_fee.toLocaleString()} ({zone.estimated_time})
                </option>
              ))}
            </select>
          </div>

          {/* Total */}
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal:</span>
              <span>${getCartTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Envío ({deliveryZone?.name}):</span>
              <span>${(deliveryZone?.delivery_fee || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-red-600 border-t pt-2">
              <span>Total:</span>
              <span>${(getCartTotal() + (deliveryZone?.delivery_fee || 0)).toLocaleString()}</span>
            </div>
          </div>

          {/* Customer Info */}
          {showCheckout && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg">Datos de envío</h3>
              <input
                type="text"
                placeholder="Nombre completo *"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
              <input
                type="tel"
                placeholder="Teléfono *"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
              <textarea
                placeholder="Dirección completa *"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                rows={3}
              />
              <textarea
                placeholder="Instrucciones especiales (opcional)"
                value={customerInfo.instructions}
                onChange={(e) => setCustomerInfo({...customerInfo, instructions: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                rows={2}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold"
              >
                Continuar compra
              </button>
            ) : (
              <button
                onClick={handleWhatsAppOrder}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>📱</span>
                <span>Pedir por WhatsApp</span>
              </button>
            )}
            <button
              onClick={clearCart}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Vaciar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Menu Component (Customer App)
const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchMenuItems();
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      await axios.post(`${API}/initialize-data`);
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando menú...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¡Los mejores lomitos y hamburguesas de Córdoba! 🍔
          </h2>
          <p className="text-lg opacity-90">
            Delivery rápido • Ingredientes frescos • Sabor casero
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <MenuCategories 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay productos disponibles en esta categoría</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4">DUO Previa</h3>
          <p className="mb-2">📍 Córdoba, Argentina</p>
          <p className="mb-2">📱 WhatsApp: +54 9 351 234-5678</p>
          <p className="mb-4">🕒 Lun-Dom: 18:00 - 01:00</p>
          <p className="text-sm opacity-75">
            © 2024 DUO Previa. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Router Component
const AppRouter = () => {
  const { isAuthenticated } = React.useContext(AuthContext);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const checkAdminRoute = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };
    
    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    return () => window.removeEventListener('popstate', checkAdminRoute);
  }, []);

  // Simple routing logic
  if (isAdminRoute) {
    return isAuthenticated ? <AdminDashboard /> : <AdminLogin />;
  } else {
    return <Menu />;
  }
};

// Main App Component
function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <AppRouter />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;