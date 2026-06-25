import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Checkout.css";
import { toast } from "react-toastify";

export default function Checkout() {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart, reloadCartForUser } = useCart();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [promoCode, setPromoCode] = useState("");
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const cartTotal = getCartTotal();
    const finalAmount = Math.max(cartTotal - discountAmount, 0);

    const [address, setAddress] = useState({
        type: "Home",
        name: "",
        email: "",
        mobile: "",
        flatNo: "",
        address: "",
        country: "India",
        state: "Gujarat",
        city: "",
        pincode: "",
    });

    const getToken = () => localStorage.getItem("token");

    const applyPromo = async () => {
        if (!promoCode.trim()) {
            toast.error("Please enter promo code");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/promos/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: promoCode,
                    orderAmount: getCartTotal(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message);
                return;
            }

            setAppliedPromo(data.promo.code);
            setDiscountAmount(Number(data.discountAmount));

            toast.success(data.message);
        } catch (err) {
            console.log(err);
            toast.error("Something went wrong");
        }
    };

    const removePromo = () => {
        setPromoCode("");
        setAppliedPromo(null);
        setDiscountAmount(0);
        toast.info("Promo removed");
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            setAddress((prev) => ({
                ...prev,
                name: user.name || "",
                email: user.email || "",
            }));

            loadAddresses();
        }
    }, []);

    const loadAddresses = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/users/addresses", {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            const data = await res.json();

            if (Array.isArray(data)) {
                setSavedAddresses(data);

                if (data.length > 0) {
                    setSelectedAddressId(data[0]._id);
                } else {
                    setUseNewAddress(true);
                }
            }
        } catch (err) {
            console.error("Failed to load addresses:", err);
        }
    };

    const handleChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value,
        });
    };

    const validateNewAddress = () => {
        return (
            address.type &&
            address.name &&
            address.email &&
            address.mobile &&
            address.address &&
            address.country &&
            address.state &&
            address.city &&
            address.pincode
        );
    };

    const getFinalAddress = async () => {
        if (useNewAddress) {
            if (!validateNewAddress()) {
                toast.error("Please fill full address");
                return null;
            }

            const res = await fetch("http://localhost:5000/api/users/addresses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(address),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Failed to save address");
                return null;
            }

            return {
                fullName: address.name,
                phone: address.mobile,
                houseNo: address.flatNo,
                street: address.address,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
            };
        }

        const selected = savedAddresses.find(
            (addr) => addr._id === selectedAddressId
        );

        if (!selected) {
            toast.error("Please select address");
            return null;
        }

        return {
            fullName: selected.name,
            phone: selected.mobile,
            houseNo: selected.flatNo,
            street: selected.address,
            city: selected.city,
            state: selected.state,
            pincode: selected.pincode,
        };
    };

    const handlePayment = async () => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user) {
            toast.error("Please login first");
            navigate("/login");
            return;
        }

        if (!cart || cart.length === 0) {
            toast.error("Cart is empty");
            navigate("/cart");
            return;
        }

        const finalAddress = await getFinalAddress();

        if (!finalAddress) return;

        try {
            const res = await fetch("http://localhost:5000/api/payment/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cart,
                    promoCode: appliedPromo
                }),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error("Payment order failed");
                return;
            }

            const options = {
                key: data.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "Garment",
                description: "Order Payment",
                order_id: data.order.id,

                handler: async function (response) {
                    const verifyRes = await fetch(
                        "http://localhost:5000/api/payment/verify-payment",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(response),
                        }
                    );

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        await placeOrder(response.razorpay_payment_id, finalAddress);
                    } else {
                        toast.error("Payment verification failed");
                    }
                },

                prefill: {
                    name: user.name || finalAddress.fullName,
                    email: user.email,
                    contact: finalAddress.phone,
                },

                theme: {
                    color: "#710400",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong in payment");
        }
    };

    const placeOrder = async (paymentId, finalAddress) => {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        try {
            const response = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cart.map((item) => ({
                        garmentId: item.garment._id,
                        title: item.garment.title,
                        price: Number(item.garment.selectedPrice || item.garment.price),
                        size: item.size,
                        quantity: item.quantity,
                        colorName: item.garment.selectedColorName,
                        colorCode: item.garment.selectedColorCode,
                        imageUrl: item.garment.imageUrl,
                    })),
                    originalAmount: cartTotal,
                    discountAmount,
                    promoCode: appliedPromo,
                    totalAmount: finalAmount,
                    userEmail: user.email,
                    address: finalAddress,
                    paymentMethod: "Online",
                    paymentId,
                    paymentStatus: "Paid",
                }),
            });

            if (response.ok) {
                toast.success("Order placed successfully!");
                clearCart();
                reloadCartForUser();
                navigate("/my-orders");
            } else {
                toast.error("Order creation failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Order failed");
        }
    };

    return (
        <div className="checkout-page">
            <h1>Checkout</h1>

            <div className="checkout-layout">
                <div className="checkout-form">
                    <h2>Delivery Address</h2>

                    {savedAddresses.length > 0 && (
                        <div className="saved-address-list">
                            {savedAddresses.map((addr) => (
                                <div
                                    key={addr._id}
                                    className={
                                        selectedAddressId === addr._id && !useNewAddress
                                            ? "checkout-address-card active"
                                            : "checkout-address-card"
                                    }
                                    onClick={() => {
                                        setSelectedAddressId(addr._id);
                                        setUseNewAddress(false);
                                    }}
                                >
                                    <h3>{addr.type}</h3>
                                    <p>
                                        <b>{addr.name}</b>
                                    </p>
                                    <p>{addr.mobile}</p>
                                    <p>
                                        {addr.flatNo && `${addr.flatNo}, `}
                                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        className="add-new-address-btn"
                        onClick={() => setUseNewAddress(true)}
                    >
                        Add New Address
                    </button>

                    {useNewAddress && (
                        <>
                            <select name="type" value={address.type} onChange={handleChange} className="type-select" >
                                <option value="Home">Home</option>
                                <option value="Office">Office</option>
                                <option value="Other">Other</option>
                            </select>

                            <input
                                name="name"
                                placeholder="Full Name"
                                value={address.name}
                                onChange={handleChange}
                            />

                            <input
                                name="email"
                                placeholder="Email"
                                value={address.email}
                                onChange={handleChange}
                            />

                            <input
                                name="mobile"
                                placeholder="Phone Number"
                                value={address.mobile}
                                onChange={handleChange}
                            />

                            <input
                                name="flatNo"
                                placeholder="House No / Flat No"
                                value={address.flatNo}
                                onChange={handleChange}
                            />

                            <input
                                name="address"
                                placeholder="Street / Area"
                                value={address.address}
                                onChange={handleChange}
                            />

                            <input
                                name="city"
                                placeholder="City"
                                value={address.city}
                                onChange={handleChange}
                            />

                            <input
                                name="state"
                                placeholder="State"
                                value={address.state}
                                onChange={handleChange}
                            />

                            <input
                                name="pincode"
                                placeholder="Pincode"
                                value={address.pincode}
                                onChange={handleChange}
                            />
                        </>
                    )}
                    <h2>Payment Option</h2>

                    <div className="payment-option">
                        <input type="radio" checked readOnly />
                        <span>Online Payment</span>
                    </div>

                    <button className="pay-now-btn" onClick={handlePayment}>
                        Pay Now ₹{finalAmount.toFixed(2)}
                    </button>
                </div>

                <div className="checkout-summary">
                    <h2>Order Summary</h2>

                    {cart.map((item) => (
                        <div
                            className="checkout-item"
                            key={`${item.garment._id}-${item.size}`}
                        >
                            <span>
                                {item.garment.title} × {item.quantity}
                            </span>
                            <span>
                                ₹
                                {(
                                    Number(item.garment.selectedPrice || item.garment.price) *
                                    item.quantity
                                ).toFixed(2)}
                            </span>
                        </div>
                    ))}

                    <hr />

                    <div className="promo-box">
                        <input
                            type="text"
                            placeholder="Enter promo code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            disabled={!!appliedPromo}
                        />

                        {!appliedPromo ? (
                            <button onClick={applyPromo} className="btn">
                                Apply
                            </button>
                        ) : (
                            <button onClick={removePromo} className="btn remove-promo-btn">
                                Remove
                            </button>
                        )}
                    </div>

                    {appliedPromo && (
                        <p className="promo-success">
                            {appliedPromo} applied! You saved ₹{discountAmount.toFixed(2)}
                        </p>
                    )}
                    <hr />
                    <div className="price-row">
                        <span>Subtotal</span>
                        <strong>₹{cartTotal.toFixed(2)}</strong>
                    </div>

                    {discountAmount > 0 && (
                        <div className="price-row discount-row">
                            <span>Discount</span>
                            <strong>-₹{discountAmount.toFixed(2)}</strong>
                        </div>
                    )}

                    <div className="checkout-total">
                        <span>Final Total</span>
                        <strong>₹{finalAmount.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}