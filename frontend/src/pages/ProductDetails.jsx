import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getPriceBySize, getDiscountedPrice } from "../utils/priceUtils";
import './ProductDetails.css';
export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const { addToCart } = useCart();
    const [selectedSizes, setSelectedSizes] = useState({});
    const [selectedColor, setSelectedColor] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const [similarSelectedSizes, setSimilarSelectedSizes] = useState({});

    const [similar, setSimilar] = useState([]);

    useEffect(() => {

        fetchProduct();
        fetchSimilar();

    }, [id]);

    useEffect(() => {
        const initialSizes = {};

        similar.forEach((item) => {
            initialSizes[item._id] = item.sizes?.[0];
        });

        setSimilarSelectedSizes(initialSizes);
    }, [similar]);

    function AddTocart(garment) {
        const selectedSize =
            selectedSizes[garment._id] || garment.sizes?.[0];

        const originalPrice = getPriceBySize(garment, selectedSize);
        const finalPrice = getDiscountedPrice(originalPrice, garment.discount);

        addToCart(
            {
                ...garment,
                imageUrl:
                    mainImage ||
                    selectedColor?.images?.[0] ||
                    selectedColor?.imageUrl ||
                    garment.imageUrl,
                selectedColorName: selectedColor?.colorName || "",
                selectedColorCode: selectedColor?.colorCode || garment.color,
                selectedPrice: finalPrice,
                selectedOriginalPrice: originalPrice,
            },
            selectedSize
        );
    }

    const fetchProduct = async () => {

        const res = await fetch(
            `http://localhost:5000/api/garments/${id}`
        );

        const data = await res.json();

        setProduct(data);

        if (data.colorVariants?.length > 0) {
            setSelectedColor(data.colorVariants[0]);

            const firstImage =
                data.colorVariants[0].images?.[0] ||
                data.colorVariants[0].imageUrl ||
                data.imageUrl;

            setMainImage(firstImage);
        } else {
            setSelectedColor(null);
            setMainImage(data.imageUrl);
        }
    };

    const fetchSimilar = async () => {

        const res = await fetch(
            `http://localhost:5000/api/garments/similar/${id}`
        );

        const data = await res.json();

        setSimilar(data);
    };

    if (!product) {
        return <h2>Loading...</h2>;
    }

    const selectedSize = selectedSizes[product._id] || product.sizes?.[0];

    const originalPrice = getPriceBySize(product, selectedSize);
    const finalPrice = getDiscountedPrice(originalPrice, product.discount);
    const discount = Number(product.discount || 0);
    const displayImage =
        selectedColor?.imageUrl || product.imageUrl;

    const displayColor =
        selectedColor?.colorCode || product.color;

    const handleColorSelect = (variant) => {
        setSelectedColor(variant);

        const firstImage =
            variant.images?.[0] ||
            variant.imageUrl ||
            product.imageUrl;

        setMainImage(firstImage);
    };

    return (
        <div className="product-page">
            <div className="product-container">

                <div className="product-image-section">
                    <div className="product-gallery">
                        <div className="thumbnail-list">
                            {(selectedColor?.images?.length > 0
                                ? selectedColor.images
                                : [selectedColor?.imageUrl || product.imageUrl]
                            ).map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={product.title}
                                    className={`thumbnail-img ${mainImage === img ? "active-thumbnail" : ""
                                        }`}
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>

                        <div className="main-image-box">
                            <img
                                src={mainImage || displayImage}
                                alt={product.title}
                                className="product-image"
                            />
                        </div>
                    </div>
                </div>

                <div className="product-info-section">
                    <h1>{product.title}</h1>

                    <h2 className="product-price">
                        {discount > 0 ? (
                            <>
                                <span className="original-price">
                                    ₹{originalPrice.toFixed(2)}
                                </span>

                                <span className="discounted-price">
                                    ₹{finalPrice.toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="discounted-price">
                                ₹{originalPrice.toFixed(2)}
                            </span>
                        )}
                    </h2>

                    <p className="product-meta">
                        <strong>Category:</strong> {product.category}
                    </p>

                    <p className="product-meta">
                        <strong>Sub Category:</strong> {product.subCategory}
                    </p>

                    <p className="product-meta">
                        <strong>Fabric:</strong> {product.fabric}
                    </p>
                    {product.colorVariants?.length > 0 && (
                        <div className="product-detail-colors">
                            <p className="product-meta">
                                <strong>Color:</strong>{" "}
                                {selectedColor?.colorName || displayColor}
                            </p>

                            <div className="detail-color-options">
                                {product.colorVariants.map((variant, index) => (
                                    <button
                                        key={`${variant.colorCode}-${index}`}
                                        type="button"
                                        className={`detail-color-dot ${selectedColor?.colorCode === variant.colorCode
                                            ? "selected-detail-color"
                                            : ""
                                            }`}
                                        style={{
                                            backgroundColor: variant.colorCode,
                                        }}
                                        title={variant.colorName}
                                        onClick={() => handleColorSelect(variant)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="garment-sizes">
                        {product.sizes.map((size, idx) => (
                            <button
                                key={idx}
                                className={`size-badge ${selectedSize === size ? "selected-size" : ""
                                    }`}
                                onClick={() =>
                                    setSelectedSizes(prev => ({
                                        ...prev,
                                        [product._id]: size
                                    }))
                                }
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    <button className="add-cart-btn" onClick={() => AddTocart(product)}>
                        Add To Cart
                    </button>
                </div>

            </div>

            <div className="description-section">
                <h2>Product Details</h2>

                <p>
                    Premium quality {product.fabric} {product.subCategory} crafted for comfort and style. Suitable for casual
                    wear, festive occasions and daily use.
                </p>
            </div>

            <div className="similar-products-section">
                <h2>Similar Products</h2>

                <div className="garments-grid">
                    {similar.map((item) => {
                        const itemSize =
                            similarSelectedSizes[item._id] || item.sizes?.[0];

                        const itemOriginalPrice = getPriceBySize(item, itemSize);
                        const itemDiscount = Number(item.discount || 0);
                        const itemFinalPrice = getDiscountedPrice(
                            itemOriginalPrice,
                            itemDiscount
                        );

                        const itemImage =
                            item.colorVariants?.[0]?.images?.[0] ||
                            item.colorVariants?.[0]?.imageUrl ||
                            item.imageUrl;

                        const itemColor =
                            item.colorVariants?.[0]?.colorCode ||
                            item.color;

                        return (
                            <div key={item._id} className="garment-card">
                                <div
                                    className="garment-image-container"
                                    onClick={() => {
                                        navigate(`/product/${item._id}`);
                                        window.scrollTo({
                                            top: 0,
                                            behavior: "smooth",
                                        });
                                    }}
                                >
                                    {itemImage ? (
                                        <img
                                            src={itemImage}
                                            alt={item.title}
                                            className="garment-image"
                                        />
                                    ) : (
                                        <div className="placeholder-image">No Image</div>
                                    )}

                                    {itemDiscount > 0 && (
                                        <span className="deal-badge">
                                            {itemDiscount}% OFF
                                        </span>
                                    )}
                                </div>

                                <div className="garment-info">
                                    <div className="garment-header">
                                        <h3>{item.title}</h3>

                                        <span
                                            className="color-swatch"
                                            style={{ backgroundColor: itemColor }}
                                            title={`Color: ${itemColor}`}
                                        />
                                    </div>

                                    <p className="garment-subcategory">
                                        {item.subCategory} • {item.fabric}
                                    </p>

                                    <div className="garment-sizes">
                                        {(item.sizes || []).map((size, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={`size-badge ${itemSize === size ? "selected-size" : ""
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    setSimilarSelectedSizes((prev) => ({
                                                        ...prev,
                                                        [item._id]: size,
                                                    }));
                                                }}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div className="price-container">
                                            {itemDiscount > 0 ? (
                                                <>
                                                    <span className="original-price">
                                                        ₹{itemOriginalPrice.toFixed(2)}
                                                    </span>

                                                    <span className="discounted-price">
                                                        ₹{itemFinalPrice.toFixed(2)}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="discounted-price">
                                                    ₹{itemOriginalPrice.toFixed(2)}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            className="primary-btn"
                                            style={{
                                                padding: "10px 20px",
                                                fontSize: "0.9rem",
                                            }}
                                            onClick={() => {
                                                const selectedSimilarSize =
                                                    similarSelectedSizes[item._id] || item.sizes?.[0];

                                                const originalPrice = getPriceBySize(
                                                    item,
                                                    selectedSimilarSize
                                                );

                                                const finalPrice = getDiscountedPrice(
                                                    originalPrice,
                                                    item.discount
                                                );

                                                addToCart(
                                                    {
                                                        ...item,
                                                        imageUrl: itemImage,
                                                        selectedColorName:
                                                            item.colorVariants?.[0]?.colorName || "",
                                                        selectedColorCode: itemColor,
                                                        selectedPrice: finalPrice,
                                                        selectedOriginalPrice: originalPrice,
                                                    },
                                                    selectedSimilarSize
                                                );
                                            }}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}