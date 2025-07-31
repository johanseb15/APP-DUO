import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

export default NotificationManagement;