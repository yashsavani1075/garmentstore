import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const API = "http://localhost:5000/api/cart";

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const getUserEmail = () => {
    const user = getCurrentUser();
    return user?.email;
  };

  const reloadCartForUser = async () => {
    const userEmail = getUserEmail();

    if (!userEmail) {
      setCart([]);
      return;
    }

    try {
      const res = await fetch(`${API}/${userEmail}`);
      const data = await res.json();
      setCart(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load cart", error);
      setCart([]);
    }
  };

  useEffect(() => {
    reloadCartForUser();
  }, []);

  const addToCart = async (garment, size) => {
    const userEmail = getUserEmail();

    if (!userEmail) {
      toast.error("Please login first");
      return;
    }

    if (!size) {
      toast.error("Please select a size before adding to cart!");
      return;
    }

    try {
      const res = await fetch(`${API}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          garmentId: garment._id,
          size,
          selectedColorName: garment.selectedColorName || "",
          selectedColorCode:
            garment.selectedColorCode || garment.color || "",
          imageUrl: garment.imageUrl || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to add to cart");
        return;
      }

      setCart(data);
      toast.success("Added to cart!");
    } catch (error) {
      console.error(error);
      toast.error("Cart update failed");
    }
  };

  const updateQuantity = async (garmentId, size, newQuantity, colorCode) => {
    const userEmail = getUserEmail();

    if (!userEmail) return;

    try {
      const res = await fetch(`${API}/quantity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          garmentId,
          size,
          colorCode,
          quantity: newQuantity,
        }),
      });

      const data = await res.json();
      setCart(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update quantity");
    }
  };

  const removeFromCart = async (garmentId, size, colorCode) => {
    const userEmail = getUserEmail();

    if (!userEmail) return;

    try {
      const res = await fetch(`${API}/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          garmentId,
          size,
          colorCode,
        }),
      });

      const data = await res.json();
      setCart(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    const userEmail = getUserEmail();

    if (!userEmail) {
      setCart([]);
      return;
    }

    try {
      const res = await fetch(`${API}/${userEmail}`, {
        method: "DELETE",
      });

      const data = await res.json();
      setCart(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear cart");
    }
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