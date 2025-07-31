import React from "react";

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

export default AdminSidebar;