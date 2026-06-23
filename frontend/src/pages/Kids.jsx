import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useNavigate, useParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import { getPriceBySize, getDiscountedPrice } from "../utils/priceUtils";
import { useWishlist } from '../context/WishlistContext';
import './Home.css';
import '../components/FilterSidebar.css';

const EMPTY_FILTERS = { priceMin: null, priceMax: null, subcategories: [], fabrics: [], colors: [], sizes: [] };

export default function Kids() {
  const navigate = useNavigate();
  const { subCategory } = useParams();
  const [garments, setGarments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { addToCart } = useCart();
  const { search } = useSearch();
  const { toggleWishlist, isWishlisted } = useWishlist();

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
    fetch('http://localhost:5000/api/garments')
      .then((r) => r.json())
      .then((data) => setGarments(data.filter((g) => g.category?.trim().toLowerCase() === 'kids')))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredGarments = (() => {
    let r = subCategory
      ? garments.filter(
        (g) => g.subCategory?.toLowerCase() === subCategory.toLowerCase()
      )
      : garments;

    // Search filter
    if (search.trim()) {
      r = r.filter(
        (g) =>
          g.title?.toLowerCase().includes(search.toLowerCase()) ||
          g.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
          g.fabric?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filters.priceMin !== null && filters.priceMax !== null) {
      result = result.filter((g) => {
        const sizes = g.sizes || [];

        return sizes.some((size) => {
          const originalPrice = getPriceBySize(g, size);

          const finalPrice = getDiscountedPrice(
            originalPrice,
            g.discount || 0
          );

          return (
            finalPrice >= filters.priceMin &&
            finalPrice <= filters.priceMax
          );
        });
      });
    }

    if (filters.subcategories.length)
      r = r.filter((g) => filters.subcategories.includes(g.subCategory));

    if (filters.fabrics.length)
      r = r.filter((g) => filters.fabrics.includes(g.fabric));

    if (filters.colors.length)
      r = r.filter((g) => {

        const productColors = [
          ...(g.color ? [g.color] : []),
          ...(g.colorVariants?.map(v => v.colorCode) || [])
        ];

        return filters.colors.some(color =>
          productColors.includes(color)
        );
      });

    if (filters.sizes.length)
      r = r.filter((g) =>
        (g.sizes || []).some((s) => filters.sizes.includes(s))
      );

    return r;
  })();

  return (
    <div className="home-container">
      <header className="newarrival-hero">
        <div className="newarrival-hero-content">
          <h1>{subCategory ? `${subCategory} Collection` : 'Kids Collection'}</h1>
        </div>
      </header>

      <div style={{ padding: '12px 28px 0' }}>
        <button className="mobile-filter-toggle" onClick={() => setMobileOpen(true)}>⚙ Filters</button>
      </div>
      <div className={`mobile-sidebar-overlay${mobileOpen ? ' visible' : ''}`} onClick={() => setMobileOpen(false)} />

      <div className="shop-layout">
        <FilterSidebar
          className={mobileOpen ? 'mobile-open' : ''}
          garments={garments}
          filters={filters}
          onFilterChange={setFilters}
          onClearAll={() => setFilters(EMPTY_FILTERS)}
        />
        <div className="shop-products">
          <div className="shop-results-bar">
            <span className="shop-results-count">{filteredGarments.length} item{filteredGarments.length !== 1 ? 's' : ''} found</span>
          </div>
          {loading ? (
            <div className="loading-state">Loading Kids' Collection...</div>
          ) : filteredGarments.length === 0 ? (
            <div className="empty-state">No garments match your filters.</div>
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
                  <div key={garment._id} className="garment-card">
                    <div
                          className="garment-image-container"
                          onClick={() => navigate(`/product/${garment._id}`)}
                        >

                          <button
                            className={`wishlist-heart-btn ${isWishlisted(
                              garment._id,
                              selectedSize,
                              displayColor
                            )
                                ? "active"
                                : ""
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();

                              const selectedSize = selectedSizes[garment._id];
                              const selectedColor = selectedColors[garment._id];

                              toggleWishlist({
                                garmentId: garment._id,
                                size: selectedSize,
                                selectedColorName: selectedColor?.colorName || "",
                                selectedColorCode: selectedColor?.colorCode || garment.color,
                                imageUrl:
                                  selectedColor?.images?.[0] ||
                                  selectedColor?.imageUrl ||
                                  garment.imageUrl,
                              });
                            }}
                          >
                            ♥
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
                        <span className="color-swatch" style={{ backgroundColor: displayColor }} title={`Color: ${displayColor}`} />
                      </div>
                      <p className="garment-subcategory">{garment.subCategory} • {garment.fabric}</p>
                      <div className="garment-sizes">
                        {garment.sizes.map((size, idx) => (
                          <button key={idx} className={`size-badge ${selectedSizes[garment._id] === size ? 'selected-size' : ''}`}
                            onClick={() => setSelectedSizes((prev) => ({ ...prev, [garment._id]: size }))}>{size}</button>
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
        </div>
      </div>
    </div>
  );
}
