import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyOrders.css";

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`http://localhost:5000/api/orders/user/${user.email}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="my-orders-container">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You have no previous orders.</p>
          <Link to="/">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <span className="order-status">{order.status}</span>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <span>{item.title}</span>
                    <span>Size: {item.size}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                Total: ₹{Number(order.totalAmount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}