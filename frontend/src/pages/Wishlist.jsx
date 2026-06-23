import React from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { getPriceBySize, getDiscountedPrice } from "../utils/priceUtils";
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

          const selectedSize = item.size || product.sizes?.[0];

          const originalPrice = getPriceBySize(product, selectedSize);
          const finalPrice = getDiscountedPrice(
            originalPrice,
            product.discount
          );

          return (
            <div
              className="wishlist-card"
              key={`${product._id}-${item.size}-${item.selectedColorCode}`}
            >
              <div
                className="wishlist-image-box"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                {item.imageUrl || product.imageUrl ? (
                  <img
                    src={item.imageUrl || product.imageUrl}
                    alt={product.title}
                  />
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

                <p>
                  {product.category} • {product.subCategory}
                </p>

                <p>
                  Size: <strong>{selectedSize}</strong>
                </p>

                {item.selectedColorName && (
                  <p>
                    Color: <strong>{item.selectedColorName}</strong>
                  </p>
                )}

                <strong>₹{finalPrice}</strong>

                <div className="wishlist-actions">
                  <button
                    className="wishlist-cart-btn"
                    onClick={async () => {
                      await addToCart(
                        {
                          ...product,
                          selectedColorName: item.selectedColorName || "",
                          selectedColorCode:
                            item.selectedColorCode || product.color,
                          selectedPrice: finalPrice,
                          selectedOriginalPrice: originalPrice,
                          imageUrl: item.imageUrl || product.imageUrl,
                        },
                        selectedSize
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