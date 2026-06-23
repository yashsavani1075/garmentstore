import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AiChat.css";

export default function AiChat() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([
        {
            sender: "bot",
            text:
                "✨ Welcome to GarmentStore\n\nTell me what you're looking for and I'll find the best matches.\n\nPlease type \"Reset\" for reset context",
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [lastProducts, setLastProducts] = useState([]);
    const [currentFilters, setCurrentFilters] = useState({});

    const navigate = useNavigate();

    const askAI = async () => {
        if (!message.trim()) return;

        const userMessage = message;

        setChats((prev) => [
            ...prev,
            { sender: "user", text: userMessage },
        ]);

        setMessage("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/ai/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    lastProducts,
                    currentFilters,
                }),
            });

            const data = await res.json();

            if (data.action === "RESET") {
                setCurrentFilters({});
                setLastProducts([]);
            } else if (data.filters) {
                setCurrentFilters(data.filters);
            }

            if (data.products) {
                setLastProducts(data.products);
            }

            if (data.action === "VIEW_PRODUCT" && data.navigateTo) {
                navigate(data.navigateTo);
            }

            if (data.action === "TRACK_ORDER" && data.navigateTo) {
                navigate(data.navigateTo);
            }

            setChats((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: data.reply || "Sorry, I could not understand that.",
                    products:
                        data.action === "VIEW_PRODUCT" ||
                        data.action === "TRACK_ORDER"
                            ? []
                            : data.products || [],
                },
            ]);
        } catch (err) {
            setChats((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "AI response failed.",
                    products: [],
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getProductImage = (product) => {
        const img =
            product.imageUrl ||
            product.colorVariants?.[0]?.imageUrl;

        if (!img) return "https://via.placeholder.com/150";

        if (img.startsWith("http")) return img;

        return `http://localhost:5000${img}`;
    };

    return (
        <>
            <button className="ai-chat-button" onClick={() => setOpen(!open)}>
                AI
            </button>

            {open && (
                <div className="ai-chatbox">
                    <div className="ai-chat-header">
                        <span>Garment Assistant</span>
                        <button onClick={() => setOpen(false)}>×</button>
                    </div>

                    <div className="ai-chat-body">
                        {chats.map((chat, index) => (
                            <div
                                key={index}
                                className={chat.sender === "user" ? "user-msg" : "bot-msg"}
                            >
                                {chat.sender === "user" && <p>{chat.text}</p>}

                                {chat.sender === "bot" && chat.text && (
                                    <p className="ai-summary">{chat.text}</p>
                                )}

                                {chat.products?.length > 0 && (
                                    <div className="ai-products">
                                        {chat.products.map((product) => (
                                            <div className="ai-product-card" key={product._id}>
                                                <img
                                                    src={getProductImage(product)}
                                                    alt={product.title}
                                                />

                                                <div>
                                                    <h4>{product.title}</h4>

                                                    {product.discount > 0 ? (
                                                        <>
                                                            <p>
                                                                <del>₹{product.price}</del>{" "}
                                                                ₹{product.finalPrice}
                                                            </p>
                                                            <p>{product.discount}% OFF</p>
                                                        </>
                                                    ) : (
                                                        <p>₹{product.price}</p>
                                                    )}

                                                    <p>{product.fabric || "N/A"}</p>
                                                    <p>{product.displayColor || "N/A"}</p>

                                                    <div className="ai-card-actions">
                                                        <button
                                                            onClick={() =>
                                                                navigate(`/product/${product._id}`)
                                                            }
                                                        >
                                                            View Product
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && <p className="bot-msg">Thinking...</p>}
                    </div>

                    <div className="ai-suggestions">
                        {[
                            "Show cotton shirts",
                            "Show cheapest t-shirts",
                            "Women kurtis",
                            "Sarees on discount",
                        ].map((item) => (
                            <button
                                key={item}
                                onClick={() => setMessage(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <div className="ai-chat-input">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask about products..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") askAI();
                            }}
                        />
                        <button onClick={askAI}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
}