import React from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "./Wishlist.css";

export default function Wishlist() {
    const navigate = useNavigate();
    const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (wishlist.length === 0) {
        return (
            <div className="wishlist-empty">
                <h2>Your Wishlist is Empty</h2>
                <p>Save products you love and find them here later.</p>
                <button onClick={() => navigate("/")}>Start Shopping</button>
            </div>
        );
    }

    // async function removeFromCart(item) {
    //     const defaultSize = product.sizes?.[0];

    //     await addToCart(
    //         {
    //             ...product,
    //             selectedColorName:
    //                 product.colorVariants?.[0]?.colorName || "",
    //             selectedColorCode:
    //                 product.colorVariants?.[0]?.colorCode || product.color,
    //             selectedPrice: product.price,
    //             selectedOriginalPrice: product.price,
    //             imageUrl:
    //                 product.colorVariants?.[0]?.imageUrl ||
    //                 product.imageUrl,
    //         },
    //         defaultSize
    //     );

    //     await toggleWishlist(product._id);
    // }



    return (
        <div className="wishlist-page">
            <div className="wishlist-header">
                <div>
                    <h1>My Wishlist</h1>
                    <p>{wishlist.length} saved item(s)</p>
                </div>

                <button className="clear-wishlist-btn" onClick={clearWishlist}>
                    Clear Wishlist
                </button>
            </div>

            <div className="wishlist-grid">
                {wishlist.map((item) => {
                    const product = item.garment;

                    return (
                        <div className="wishlist-card" key={item._id}>
                            <div
                                className="wishlist-image-box"
                                onClick={() => navigate(`/product/${product._id}`)}
                            >
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.title} />
                                ) : (
                                    <div className="wishlist-placeholder">No Image</div>
                                )}

                                {Number(product.discount || 0) > 0 && (
                                    <span className="wishlist-discount">
                                        {product.discount}% OFF
                                    </span>
                                )}
                            </div>

                            <div className="wishlist-info">
                                <h3>{product.title}</h3>
                                <p>{product.category} • {product.subCategory}</p>
                                <strong>₹{product.price}</strong>

                                <div className="wishlist-actions">
                                    <button
                                        className="wishlist-cart-btn"
                                        onClick={async () => {
                                            const defaultSize = product.sizes?.[0];

                                            await addToCart(
                                                {
                                                    ...product,
                                                    selectedColorName:
                                                        product.colorVariants?.[0]?.colorName || "",
                                                    selectedColorCode:
                                                        product.colorVariants?.[0]?.colorCode || product.color,
                                                    selectedPrice: product.price,
                                                    selectedOriginalPrice: product.price,
                                                    imageUrl:
                                                        product.colorVariants?.[0]?.imageUrl ||
                                                        product.imageUrl,
                                                },
                                                defaultSize
                                            );

                                            await toggleWishlist(product._id);
                                        }}
                                    >
                                        Add To Cart
                                    </button>

                                    <button
                                        className="remove-wishlist-btn"
                                        onClick={() => toggleWishlist(product._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}