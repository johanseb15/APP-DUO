import React, { useState, useEffect } from "react";

const CartContext = React.createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const localCart = localStorage.getItem('cart');
      return localCart ? JSON.parse(localCart) : [];
    } catch (error) {
      console.error("Error parsing cart from localStorage:", error);
      return [];
    }
  });
  const [deliveryZone, setDeliveryZone] = useState(() => {
    try {
      const localDeliveryZone = localStorage.getItem('deliveryZone');
      return localDeliveryZone ? JSON.parse(localDeliveryZone) : null;
    } catch (error) {
      console.error("Error parsing deliveryZone from localStorage:", error);
      return null;
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  // Save deliveryZone to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('deliveryZone', JSON.stringify(deliveryZone));
    } catch (error) {
      console.error("Error saving deliveryZone to localStorage:", error);
    }
  }, [deliveryZone]);

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
      setCart(prevCart => prevCart.filter(item => item.menu_item_id !== menuItemId));
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

export { CartContext, CartProvider };