import React, { useState, useRef } from 'react';

const CartItem = ({ item, updateQuantity, removeFromCart }) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const itemRef = useRef(null);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsSwiping(false);
  };

  const handleTouchMove = (e) => {
    setCurrentX(e.touches[0].clientX);
    const diffX = startX - currentX;
    if (Math.abs(diffX) > 10) {
      setIsSwiping(true);
      if (itemRef.current) {
        itemRef.current.style.transform = `translateX(${-diffX}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    const diffX = startX - currentX;
    if (isSwiping && diffX > 50) { // Swipe left threshold
      removeFromCart(item.menu_item_id);
    } else if (itemRef.current) {
      itemRef.current.style.transform = 'translateX(0px)';
    }
    setIsSwiping(false);
    setStartX(0);
    setCurrentX(0);
  };

  return (
    <div 
      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        ref={itemRef}
        className="flex-1 flex items-center justify-between transition-transform duration-300 ease-out"
        style={{ width: '100%' }}
      >
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
      {/* Optional: Visual feedback for swipe to delete */}
      <div className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-end pr-4 text-white"
           style={{ width: '100%', transform: `translateX(${Math.min(0, currentX - startX)}px)` }}>
        <span>Eliminar</span>
      </div>
    </div>
  );
};

export default CartItem;
