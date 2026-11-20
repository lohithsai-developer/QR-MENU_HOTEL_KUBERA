import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kubera_selection');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableNumber, setTableNumber] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('table') || '';
    } catch {
      return '';
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('kubera_selection', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (dish) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === dish.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: dish.id,
            name: dish.name,
            price: dish.price,
            isVeg: dish.isVeg,
            image: dish.image,
            category: dish.category,
            servingSize: dish.servingSize || 'Serves 1-2',
            quantity: 1,
            specialInstructions: ''
          }
        ];
      }
    });
  };

  const removeFromCart = (dishId) => {
    setCartItems(prev => prev.filter(item => item.id !== dishId));
  };

  const updateQuantity = (dishId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(dishId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === dishId ? { ...item, quantity: newQty } : item))
    );
  };

  const updateItemInstruction = (dishId, instructions) => {
    setCartItems(prev =>
      prev.map(item => (item.id === dishId ? { ...item, specialInstructions: instructions } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + gst;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemInstruction,
        clearCart,
        totalItemsCount,
        subtotal,
        gst,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        tableNumber,
        setTableNumber
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
