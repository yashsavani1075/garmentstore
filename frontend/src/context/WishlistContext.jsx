import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const API = "http://localhost:5000/api/wishlist";

const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  const getUserEmail = () => {
    const user = getCurrentUser();
    return user?.email;
  };

  const fetchWishlist = async () => {
    const userEmail = getUserEmail();

    if (!userEmail) {
      setWishlist([]);
      return;
    }

    try {
      const res = await fetch(`${API}/${userEmail}`);
      const data = await res.json();

      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setWishlist([]);
    }
  };

  const toggleWishlist = async (garmentId) => {
    const userEmail = getUserEmail();

    if (!userEmail) {
      toast.error("Please login first");
      return;
    }

    try {
      const res = await fetch(`${API}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          garmentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Wishlist update failed");
        return;
      }

      setWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);

      toast.success(data.message);
    } catch (error) {
      console.error(error);
      toast.error("Wishlist update failed");
    }
  };

  const clearWishlist = async () => {
    const userEmail = getUserEmail();

    if (!userEmail) return;

    try {
      const res = await fetch(`${API}/${userEmail}`, {
        method: "DELETE",
      });

      const data = await res.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear wishlist");
    }
  };

  const isWishlisted = (garmentId) => {
    return wishlist.some((item) => item.garment?._id === garmentId);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        fetchWishlist,
        toggleWishlist,
        clearWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}