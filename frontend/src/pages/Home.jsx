import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useSearch } from "../context/SearchContext";
import CategoryTiles from "../components/CategoryTiles";
import { getPriceBySize, getDiscountedPrice } from "../utils/priceUtils";
import { useWishlist } from "../context/WishlistContext";
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const { addToCart } = useCart();
  const { search } = useSearch();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const filteredGarments = garments.filter((garment) => {
    if (!search.trim()) return true;

    return (
      garment.title?.toLowerCase().includes(search.toLowerCase()) ||
      garment.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
      garment.fabric?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const groupedGarments = filteredGarments.reduce((acc, garment) => {
    const subCategory = garment.subCategory;

    if (!acc[subCategory]) {
      acc[subCategory] = [];
    }

    acc[subCategory].push(garment);
    return acc;
  }, {});

  useEffect(() => {
    fetchGarments();
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

  const fetchGarments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/garments');
      const data = await response.json();
      setGarments(data);
    } catch (error) {
      console.error('Error fetching garments:', error);
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
      <header className="hero-section">
        {/* <div className="hero-content">
          <h1>Lorem ipsum dolor sit amet.</h1>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quisquam esse quasi debitis tempora nisi? Aliquam!</p>
          <div className="hero-actions">
            <button className="primary-btn">Shop Now</button>
            <button className="secondary-btn">View Collections</button>
          </div>
        </div> */}
        <img src="Images/hero.jpg" alt="" />
      </header>
      <CategoryTiles />
      <section className="garments-section">
        {/* <div className="section-header">
          <h2>Our Collection</h2>
          <p>Discover what's new in our collection</p>
        </div> */}

        {loading ? (
          <div className="loading-state">Loading garments...</div>
        ) : garments.length === 0 ? (
          <div className="empty-state">No garments found. Add some from the Admin Panel!</div>
        ) : (
          <>
            {Object.entries(groupedGarments).map(([subCategory, items]) => (
              <div key={subCategory} className="subcategory-section">
                <h2 className="subcategory-title">{subCategory}</h2>

                <div className="garments-grid">
                  {items.map((garment) => {
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
                      <div key={garment._id} className="garment-card">
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
                            <span
                              className="color-swatch"
                              style={{ backgroundColor: displayColor }}
                              title={`Color: ${displayColor}`}
                            ></span>
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
                          <div className='flex justify-between' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="price-container">
                              {discount > 0 ? (
                                <>
                                  <span className="original-price">
                                    ₹{originalPrice.toFixed(2)}
                                  </span>

                                  <span className="discounted-price">
                                    ₹{finalPrice.toFixed(2)}
                                  </span>

                                  {/* <span className="discount-badge">
                                    {discount}% OFF
                                  </span> */}
                                </>
                              ) : (
                                <span className="discounted-price">
                                  ₹{originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <button className='primary-btn' style={{ padding: '10px 20px', fontSize: '0.9rem' }} onClick={() => AddTocart(garment)}>Add to Cart</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
