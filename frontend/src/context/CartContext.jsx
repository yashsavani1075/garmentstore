import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const getCartKey = () => {
  const user = getCurrentUser();
  return user ? `cart_${user.email}` : "cart_guest";
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(getCartKey());

    try {
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
  }, [cart]);

  const reloadCartForUser = () => {
    const savedCart = localStorage.getItem(getCartKey());

    try {
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } catch (error) {
      console.error("Failed to reload cart", error);
      setCart([]);
    }
  };

  const addToCart = (garment, size) => {
    if (!size) {
      toast.error("Please select a size before adding to cart!");
      return;
    }

    const selectedColor =
      garment.selectedColorCode || garment.color || "";

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.garment._id === garment._id &&
          item.size === size &&
          (item.garment.selectedColorCode ||
            item.garment.color ||
            "") === selectedColor
      );

      if (existingItemIndex >= 0) {
        return prevCart.map((item, index) =>
          index === existingItemIndex
            ? {
              ...item,
              quantity: item.quantity + 1,
            }
            : item
        );
      }

      return [
        ...prevCart,
        {
          garment,
          size,
          quantity: 1,
        },
      ];
    });

    toast.success("Added to cart!");
  };

  const updateQuantity = (garmentId, size, newQuantity, colorCode) => {
    if (newQuantity < 1) {
      removeFromCart(
        garmentId,
        size,
        colorCode
      );
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.garment._id === garmentId &&
          item.size === size &&
          (item.garment.selectedColorCode ||
            item.garment.color ||
            "") === colorCode
          ? {
            ...item,
            quantity: newQuantity,
          }
          : item
      )
    );
  };

  const removeFromCart = (
    garmentId,
    size,
    colorCode
  ) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.garment._id === garmentId &&
            item.size === size &&
            (item.garment.selectedColorCode ||
              item.garment.color ||
              "") === colorCode
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(getCartKey());
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return (
        total +
        Number(item.garment.selectedPrice || item.garment.price) *
        item.quantity
      );
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        reloadCartForUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};