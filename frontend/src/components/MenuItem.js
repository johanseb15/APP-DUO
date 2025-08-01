import React, { useState, useEffect } from 'react';
import { CartContext } from '../CartContext';

const MenuItem = ({ item }) => {
  const { addToCart } = React.useContext(CartContext);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAddToCart = () => {
    addToCart(item);
    setShowConfirmation(true);
  };

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
      }, 1500); // Ocultar después de 1.5 segundos
      return () => clearTimeout(timer);
    }
  }, [showConfirmation]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 menu-item-card">
      <img
        src={item.image_url}
        alt={item.name}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-600 text-sm mt-1 mb-3">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-red-600">
            ${item.price.toLocaleString()}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors relative"
          >
            Agregar
            {showConfirmation && (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-fade-in-out">
                ¡Agregado!
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
