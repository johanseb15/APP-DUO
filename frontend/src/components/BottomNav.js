import React from 'react';

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden">
      <div className="flex justify-around py-2">
        <a href="#" className="text-center text-gray-600 hover:text-red-600">
          <span className="text-2xl">🏠</span>
          <span className="block text-xs">Inicio</span>
        </a>
        <a href="#" className="text-center text-gray-600 hover:text-red-600">
          <span className="text-2xl">🔍</span>
          <span className="block text-xs">Buscar</span>
        </a>
        <a href="#" className="text-center text-gray-600 hover:text-red-600">
          <span className="text-2xl">🛒</span>
          <span className="block text-xs">Carrito</span>
        </a>
        <a href="#" className="text-center text-gray-600 hover:text-red-600">
          <span className="text-2xl">👤</span>
          <span className="block text-xs">Perfil</span>
        </a>
      </div>
    </div>
  );
};

export default BottomNav;
