import React from "react";
import "./Sidebar.css";

export default function Sidebar({
  activePage,
  setActivePage,
}) {
  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>

      <button
        className={activePage === "add-product" ? "active" : ""}
        onClick={() => setActivePage("add-product")}
      >
        Add Product
      </button>

      <button
        className={activePage === "admin-config" ? "active" : ""}
        onClick={() => setActivePage("admin-config")}
      >
        Product Config
      </button>

      <button
        className={activePage === "admin-promos" ? "active" : ""}
        onClick={() => setActivePage("admin-promos")}
      >
        Promo Codes
      </button>

      <button
        className={activePage === "show-products" ? "active" : ""}
        onClick={() => setActivePage("show-products")}
      >
        Show Products
      </button>

      <button
        className={activePage === "orders" ? "active" : ""}
        onClick={() => setActivePage("orders")}
      >
        Orders
      </button>
    </div>
  );
}