import React, { useState, useEffect } from "react";
import Lenis from 'lenis';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import axios from "axios";
import api from "./api";
import { AuthContext, AuthProvider } from "./AuthContext";
import { CartContext, CartProvider } from "./CartContext";
import PushNotificationService from "./PushNotificationService";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

    const message = `🍔 *PEDIDO DUO PREVIA* 🍔\n\n📋 *DETALLE DEL PEDIDO:*\n${orderDetails}\n\n💰 *RESUMEN:*\nSubtotal: $${subtotal.toLocaleString()}\nEnvío (${deliveryZone?.name}): $${deliveryFee.toLocaleString()}\n*TOTAL: $${total.toLocaleString()}*\n\n👤 *DATOS DEL CLIENTE:*\nNombre: ${customerInfo.name}\nTeléfono: ${customerInfo.phone}\nZona: ${deliveryZone?.name}\nDirección: ${customerInfo.address}\n${customerInfo.instructions ? `Instrucciones: ${customerInfo.instructions}` : ''}\n\n⏰ Tiempo estimado: ${deliveryZone?.estimated_time}\n\n¡Gracias por elegir DUO Previa! 🙌`;

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
            <label htmlFor="delivery-zone-select" className="block text-sm font-medium text-gray-700 mb-2">
              Zona de envío
            </label>
            <select
              id="delivery-zone-select"
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

// Main App Component
function App() {
  const { isAuthenticated } = React.useContext(AuthContext);

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

    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/admin" element={isAuthenticated ? <AdminDashboard /> : <AdminLogin />} />
              <Route path="/" element={<Menu />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
