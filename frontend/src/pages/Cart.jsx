import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import './Cart.css';

export default function Cart() {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, reloadCartForUser } = useCart();

    if (cart.length === 0) {
        return (
            <div className="cart-empty-container">
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" className="primary-btn">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <div className="cart-header">
                <h1>Shopping Cart</h1>
                <p>Review your items and proceed to checkout.</p>
            </div>

            <div className="cart-content">
                <div className="cart-items-section">
                    {cart.map((item, index) => {
                        const originalPrice = Number(
                            item.garment.selectedOriginalPrice ||
                            item.garment.price
                        );

                        const finalPrice = Number(
                            item.garment.selectedPrice ||
                            item.garment.price
                        );

                        return (
                            <div key={`${item.garment._id}-${item.size}-${index}`} className="cart-item-card">
                                <div className="cart-item-image" onClick={() => navigate(`/product/${item.garment._id}`)}>

                                    {item.garment.imageUrl ? (

                                        <img src={item.garment.imageUrl} alt={item.garment.title} />
                                    ) : (
                                        <div className="cart-item-placeholder">No Image</div>
                                    )}
                                </div>
                                <div className="cart-item-details">
                                    <div className="cart-item-info">
                                        <h3>{item.garment.title}</h3>
                                        <p className="cart-item-category">{item.garment.category} • {item.garment.subCategory}</p>
                                        <p className="cart-item-size">Size: <strong>{item.size}</strong></p>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.garment._id,
                                                        item.size,
                                                        item.quantity - 1,
                                                        item.garment.selectedColorCode ||
                                                        item.garment.color
                                                    )
                                                }
                                            >-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(
                                                item.garment._id,
                                                item.size,
                                                item.quantity + 1,
                                                item.garment.selectedColorCode ||
                                                item.garment.color
                                            )}>+</button>
                                        </div>
                                        <div className="cart-item-price">
                                            {Number(item.garment.discount || 0) > 0 ? (
                                                <>
                                                    <div
                                                        style={{
                                                            textDecoration: "line-through",
                                                            color: "#888",
                                                            fontSize: "0.85rem"
                                                        }}
                                                    >
                                                        ₹{(originalPrice * item.quantity).toFixed(2)}
                                                    </div>

                                                    <div
                                                        style={{
                                                            color: "#710400",
                                                            fontWeight: "bold"
                                                        }}
                                                    >
                                                        ₹{(finalPrice * item.quantity).toFixed(2)}
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    ₹{(finalPrice * item.quantity).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                        <button className="remove-btn" onClick={() => removeFromCart(
                                            item.garment._id,
                                            item.size,
                                            item.garment.selectedColorCode ||
                                            item.garment.color
                                        )}>
                                            <h3>
                                                &times;
                                            </h3>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    )}
                </div>

                <div className="cart-summary-section">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <hr className="summary-divider" />
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>₹{getCartTotal().toFixed(2)}</span>
                    </div>

                    <div className="summary-actions">
                        <button
                            className="checkout-btn"
                            onClick={() => navigate("/checkout")}
                        >
                            Checkout
                        </button>
                        <button className="clear-cart-btn" onClick={clearCart}>
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
