import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const API = `${import.meta.env.VITE_API_URL}/api/wishlist`;

const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
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
            const res = await fetch(`${API}/${userEmail}`, {
                headers: getAuthHeaders(),
            });
            const data = await res.json();

            setWishlist(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setWishlist([]);
        }
    };

    const toggleWishlist = async (wishlistItem) => {
        const userEmail = getUserEmail();

        if (!userEmail) {
            toast.error("Please login first");
            return;
        }

        const isOnlyId = typeof wishlistItem === "string";

        const garmentId = isOnlyId ? wishlistItem : wishlistItem.garmentId;

        try {
            const res = await fetch(`${API}/toggle`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    userEmail,
                    garmentId,
                    size: isOnlyId ? "" : wishlistItem.size || "",
                    selectedColorName: isOnlyId ? "" : wishlistItem.selectedColorName || "",
                    selectedColorCode: isOnlyId ? "" : wishlistItem.selectedColorCode || "",
                    imageUrl: isOnlyId ? "" : wishlistItem.imageUrl || "",
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
                headers: getAuthHeaders(),
            });

            const data = await res.json();
            setWishlist(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to clear wishlist");
        }
    };

    const isWishlisted = (garmentId, size = "", colorCode = "") => {
        return wishlist.some(
            (item) =>
                item.garment?._id === garmentId &&
                (item.size || "") === (size || "") &&
                (item.selectedColorCode || "") === (colorCode || "")
        );
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