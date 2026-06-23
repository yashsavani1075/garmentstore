import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';
import { getPriceBySize, getDiscountedPrice } from "../utils/priceUtils";
import { useWishlist } from '../context/WishlistContext';
import './Home.css'; // Reusing Home styles for the garment grid

export default function NewArrival() {
  const navigate = useNavigate();
  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [latestDateStr, setLatestDateStr] = useState("");
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const { search } = useSearch();

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

  const filteredGarments = garments.filter((garment) =>
    garment.title?.toLowerCase().includes(search.toLowerCase()) ||
    garment.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
    garment.fabric?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const initialSizes = {};
    const initialColors = {};

    garments.forEach((g) => {
      initialSizes[g._id] = g.sizes?.[0];

      if (g.colorVariants?.length > 0) {
        initialColors[g._id] = g.colorVariants[0];
      }
    });

    setSelectedSizes(initialSizes);
    setSelectedColors(initialColors);
  }, [garments]);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/garments');
      const data = await response.json();

      if (data && data.length > 0) {
        // Find the latest date
        let maxDateStr = "";
        data.forEach(g => {
          let dStr = "";
          if (g.dateAdded) {
            dStr = g.dateAdded;
          } else if (g.createdAt) {
            dStr = g.createdAt.substring(0, 10);
          }
          if (dStr > maxDateStr) {
            maxDateStr = dStr;
          }
        });

        setLatestDateStr(maxDateStr);

        // Filter items that match the latest date
        const newArrivals = data.filter(g => {
          let dStr = "";
          if (g.dateAdded) {
            dStr = g.dateAdded;
          } else if (g.createdAt) {
            dStr = g.createdAt.substring(0, 10);
          }
          return dStr === maxDateStr;
        });

        setGarments(newArrivals);
      } else {
        setGarments([]);
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  //   const formatDate = (dateString) => {
  //     if (!dateString) return "";
  //     const options = { day: 'numeric', month: 'long', year: 'numeric' };
  //     return new Date(dateString).toLocaleDateString('en-GB', options);
  //   };

  return (
    <div className="home-container">
      <header className="newarrival-hero">
        <div className="newarrival-hero-content">
          <h1>New Arrivals</h1>
          {/* <p>Check out our freshest drops from {latestDateStr ? formatDate(latestDateStr) : "recently"}</p> */}
        </div>
      </header>

      <section className="newarrival-garment-section">
        {/* <div className="section-header">
          <h2>Freshly Added</h2>
          <p>Items added on {latestDateStr ? formatDate(latestDateStr) : "the latest date"}</p>
        </div> */}

        {loading ? (
          <div className="loading-state">Loading new arrivals...</div>
        ) : filteredGarments.length === 0 ? (
          <div className="empty-state">No new items found.</div>
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
                <div key={garment._id} className="garment-card" >
                 <div
                          className="garment-image-container"
                          onClick={() => navigate(`/product/${garment._id}`)}
                        >

                          <button
                            className="wishlist-heart-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(garment._id);
                            }}
                          >
                            {isWishlisted(garment._id) ? "❤️" : "🤍"}
                          </button>
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
                      <span className="color-swatch" style={{ backgroundColor: displayColor }} title={`Color: ${displayColor}`}></span>
                    </div>
                    <p className="garment-subcategory">{garment.subCategory} • {garment.fabric}</p>

                    <div className="garment-sizes">
                      {garment.sizes.map((size, idx) => (
                        <button
                          key={idx}
                          className={`size-badge ${selectedSizes[garment._id] === size ? "selected-size" : ""
                            }`}
                          onClick={() =>
                            setSelectedSizes(prev => ({
                              ...prev,
                              [garment._id]: size
                            }))
                          }
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="price-container">
                        {Number(garment.discount || 0) > 0 ? (
                          <>
                            <span className="original-price">
                              ₹{originalPrice.toFixed(2)}
                            </span>

                            <span className="discounted-price">
                              ₹{finalPrice.toFixed(2)}
                            </span>

                            {/* <span className="discount-badge">
                            {garment.discount}% OFF
                          </span> */}
                          </>
                        ) : (
                          <span className="discounted-price">
                            ₹{originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        className="primary-btn"
                        style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                        onClick={() => AddTocart(garment)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
            )}
          </div>
        )}
      </section>

    </div>
  );
}
