import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useSearch } from "../context/SearchContext";
import "./Navbar.css";

export default function Navbar() {
  const { search, setSearch } = useSearch();
  const { getCartItemCount } = useCart();

  const [categories, setCategories] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/garments");
      const garments = await res.json();

      const grouped = {};

      garments.forEach((item) => {
        if (!item.category || !item.subCategory) return;

        if (!grouped[item.category]) {
          grouped[item.category] = new Set();
        }

        grouped[item.category].add(item.subCategory);
      });

      const result = {};
      Object.keys(grouped).forEach((key) => {
        result[key] = [...grouped[key]];
      });

      setCategories(result);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link to="/" className="navbar-logo">
          Garment<span>Store</span>
        </Link>

        <div className="nav-menu">
          <NavLink to="/" className="nav-link">Home</NavLink>
          <NavLink to="/new-arrival" className="nav-link">New Arrival</NavLink>

          <div
            className="nav-dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <NavLink to="/shopby" className="nav-link dropdown-link">
              Shop By
              <span className="dropdown-arrow">▾</span>
            </NavLink>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                {Object.entries(categories).map(([category, subs]) => (
                  <div key={category} className="dropdown-category">
                    <Link
                      to={`/${category.toLowerCase()}`}
                      className="dropdown-item"
                    >
                      {category}
                      <span>›</span>
                    </Link>

                    <div className="submenu">
                      {subs.map((sub) => (
                        <Link
                          key={sub}
                          to={`/${category.toLowerCase()}/${sub.toLowerCase()}`}
                          className="submenu-item"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/hot-deals" className="nav-link">Hot Deals</NavLink>
        </div>

        <div className="nav-actions">
          <button
            className="icon-btn"
            onClick={() => setShowSearch(!showSearch)}
          >
            🔍
            <span>Search</span>
          </button>

          <NavLink to="/wishlist" className="icon-link">
            ♡ <span>Wishlist</span>
          </NavLink>

          <NavLink to="/cart" className="icon-link cart-link">
            🛒 <span>Cart</span>
            {getCartItemCount() > 0 && (
              <span className="cart-badge">{getCartItemCount()}</span>
            )}
          </NavLink>

          {token ? (
            <>
              <NavLink to="/profile/account" className="profile-link">
                Profile
              </NavLink>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <div className="auth-links">
              <NavLink to="/login" className="login-btn">Login</NavLink>
              <NavLink to="/signup" className="signup-btn">Signup</NavLink>
            </div>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="navbar-search">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for shirts, sarees, kurtis..."
            autoFocus
          />
        </div>
      )}
    </nav>
  );
}