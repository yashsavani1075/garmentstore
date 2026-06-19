import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useSearch } from "../context/SearchContext";
import { useNavigate } from "react-router-dom";
import { getPriceBySize, getDiscountedPrice } from "../utils/priceUtils";
import "./Home.css";

export default function HotDeals() {
  const navigate = useNavigate();

  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});

  const { addToCart } = useCart();
  const { search } = useSearch();

  const filteredGarments = garments.filter((garment) =>
    garment.title?.toLowerCase().includes(search.toLowerCase()) ||
    garment.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
    garment.fabric?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchHotDeals();
  }, []);

  useEffect(() => {
    const initialSizes = {};
    const initialColors = {};

    garments.forEach((garment) => {
      initialSizes[garment._id] = garment.sizes?.[0];

      if (garment.colorVariants?.length > 0) {
        initialColors[garment._id] = garment.colorVariants[0];
      }
    });

    setSelectedSizes(initialSizes);
    setSelectedColors(initialColors);
  }, [garments]);

  const fetchHotDeals = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/garments"
      );

      const data = await response.json();

      const discountedProducts = data.filter(
        (item) => Number(item.discount) > 0
      );

      setGarments(discountedProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const AddTocart = (garment) => {
    const selectedSize = selectedSizes[garment._id];
    const selectedColor = selectedColors[garment._id];

    const originalPrice = getPriceBySize(garment, selectedSize);
    const finalPrice = getDiscountedPrice(originalPrice, garment.discount);

    addToCart(
      {
        ...garment,
        imageUrl: selectedColor?.imageUrl || garment.imageUrl,
        selectedColorName: selectedColor?.colorName || "",
        selectedColorCode: selectedColor?.colorCode || garment.color,
        selectedPrice: finalPrice,
        selectedOriginalPrice: originalPrice,
      },
      selectedSize
    );
  };
  return (
    <div className="home-container">
      <header className="newarrival-hero">
        <div className="newarrival-hero-content">
          <h1>Hot Deals</h1>
        </div>
      </header>

      <section className="newarrival-garment-section">

        {loading ? (
          <div className="loading-state">
            Loading deals...
          </div>
        ) : filteredGarments.length === 0 ? (
          <div className="empty-state">
            No hot deals available right now.
          </div>
        ) : (
          <div className="garments-grid">

            {filteredGarments.map((garment) => {

              const selectedSize = selectedSizes[garment._id];
              const originalPrice = getPriceBySize(garment, selectedSize);
              const discount = Number(garment.discount || 0);
              const finalPrice = getDiscountedPrice(originalPrice, discount);
              const selectedColor = selectedColors[garment._id];

              const displayImage =
                selectedColor?.imageUrl || garment.imageUrl;

              const displayColor =
                selectedColor?.colorCode || garment.color;

              return (
                <div
                  key={garment._id}
                  className="garment-card"
                >
                  <div
                          className="garment-image-container"
                          onClick={() => navigate(`/product/${garment._id}`)}
                        >
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={garment.title}
                              className="garment-image"
                            />
                          ) : (
                            <div className="placeholder-image">No Image</div>
                          )}

                          {garment.discount > 0 && (
                            <span className="deal-badge">
                              {garment.discount}% OFF
                            </span>
                          )}

                          {garment.colorVariants?.length > 0 && (
                            <div className="product-color-options image-color-options">
                              {garment.colorVariants.map((variant, index) => (
                                <button
                                  key={`${variant.colorCode}-${index}`}
                                  type="button"
                                  className={`product-color-dot ${selectedColors[garment._id]?.colorCode === variant.colorCode
                                      ? "selected-color-dot"
                                      : ""
                                    }`}
                                  style={{ backgroundColor: variant.colorCode }}
                                  title={variant.colorName}
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    setSelectedColors((prev) => ({
                                      ...prev,
                                      [garment._id]: variant,
                                    }));
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                  <div className="garment-info">
                    <div className="garment-header">
                      <h3>{garment.title}</h3>

                      <span
                        className="color-swatch"
                        style={{
                          backgroundColor:
                            displayColor,
                        }}
                      />
                    </div>

                    <p className="garment-subcategory">
                      {garment.subCategory} •{" "}
                      {garment.fabric}
                    </p>
                    <div className="garment-sizes">
                      {garment.sizes.map(
                        (size, idx) => (
                          <button
                            key={idx}
                            className={`size-badge ${selectedSizes[
                              garment._id
                            ] === size
                              ? "selected-size"
                              : ""
                              }`}
                            onClick={() =>
                              setSelectedSizes(
                                (prev) => ({
                                  ...prev,
                                  [garment._id]:
                                    size,
                                })
                              )
                            }
                          >
                            {size}
                          </button>
                        )
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>

                        <div
                          style={{
                            textDecoration:
                              "line-through",
                            color: "#888",
                            fontSize: "0.9rem",
                          }}
                        >
                          ₹{originalPrice}
                        </div>

                        <div
                          style={{
                            fontWeight: "bold",
                            color: "#710400",
                            fontSize: "1.3rem",
                          }}
                        >
                          ₹{finalPrice.toFixed(2)}
                        </div>

                      </div>

                      <button
                        className="primary-btn"
                        onClick={() =>
                          AddTocart(garment)
                        }
                      >
                        Add to Cart
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </section>
    </div>
  );
}