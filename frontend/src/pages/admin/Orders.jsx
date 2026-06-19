import React, { useEffect, useState } from "react";
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/orders", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      const data = await res.json();

      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (
    orderId,
    status
  ) => {
    try {
      await fetch(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (id) => {
    const confirmed = window.confirm(
      "Delete this order?"
    );

    if (!confirmed) return;

    try {
      await fetch(
        `http://localhost:5000/api/orders/${id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h1>Orders</h1>
        <p>
          Manage customer orders
        </p>
      </div>

      <div className="form-card">
        <table className="product-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Email</th>
              <th>Date</th>
              <th>Total</th>
              <th>Items</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  {order._id.slice(-8)}
                </td>

                <td>
                  {order.userEmail}
                </td> 

                <td>
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString()}
                </td>

                <td>
                  ₹
                  {order.totalAmount}
                </td>

                <td>
                  {order.items.length}
                </td>

                <td>
                  <select
                    className={`status-select ${order.status.toLowerCase()}`}
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(
                        order._id,
                        e.target.value
                      )
                    }
                  >
                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Processing">
                      Processing
                    </option>

                    <option value="Shipped">
                      Shipped
                    </option>

                    <option value="Delivered">
                      Delivered
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() =>
                        setSelectedOrder(
                          order
                        )
                      }
                    >
                      View
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteOrder(
                          order._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="modal-overlay">
          <div className="large-modal">
            <h2>Order Details</h2>

            <p>
              <strong>
                Order ID:
              </strong>{" "}
              {selectedOrder._id}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {selectedOrder.userEmail}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                selectedOrder.createdAt
              ).toLocaleString()}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedOrder.status}
            </p>

            <p>
              <strong>Total:</strong> ₹
              {
                selectedOrder.totalAmount
              }
            </p>

            <h3>
              Ordered Products
            </h3>

            <table className="product-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Size</th>
                  <th>Quantity</th>
                </tr>
              </thead>

              <tbody>
                {selectedOrder.items.map(
                  (item, index) => (
                    <tr key={index}>
                      <td>
                        {item.title}
                      </td>

                      <td>
                        {item.size}
                      </td>

                      <td>
                        {
                          item.quantity
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            <div
              className="modal-actions"
            >
              <button
                className="submit-btn"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}