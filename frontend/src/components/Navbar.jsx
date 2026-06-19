import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSearch } from "../context/SearchContext";
// import { toast } from 'react-toastify';
import './Navbar.css';


export default function Navbar() {
  const { search, setSearch } = useSearch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { getCartItemCount } = useCart();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);
  const [categories, setCategories] = useState({});
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
        const category = item.category;
        const subCategory = item.subCategory;

        if (!grouped[category]) {
          grouped[category] = new Set();
        }

        grouped[category].add(subCategory);
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          {/* <img src="/Images/logo.png" alt="" /> */}
          Website
        </Link>
        <div className="nav-menu">
          <NavLink to="/" className='nav-link'>
            Home
          </NavLink>
          <NavLink to="/new-arrival" className='nav-link'>
            New Arrival
          </NavLink>
          <div className="nav-item dropdown"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <div className="shopby-container">
              <NavLink to="/shopby" className="nav-link">
                Shop By
              </NavLink>

              <button className="dropdown-toggle-btn" onClick={toggleDropdown}>▼</button>
            </div>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                {Object.entries(categories).map(([category, subs]) => (
                  <div key={category} className="dropdown-category">

                    <Link
                      to={`/${category.toLowerCase()}`}
                      className="dropdown-item"
                    >
                      {category}
                      {/* <div className="arrow-icon"> */}
                      <p>&gt;</p>
                      {/* </div> */}
                    </Link>

                    <div className="submenu">
                      {subs.map(sub => (
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
          <NavLink to="/hot-deals" className='nav-link'>
            Hot Deals
          </NavLink>
        </div>
        <div className='nav-action'>
          <div
            className="search-trigger"
            onClick={() => setShowSearch(!showSearch)}
          >
            &#x1F50D; Search
          </div>
          <NavLink to="/cart" className='nav-link'>
            🛒 Cart
            {getCartItemCount() > 0 && (
              <span className="cart-badge">{getCartItemCount()}</span>
            )}
          </NavLink>
          <NavLink to="/profile/account" className='nav-link'>Profile</NavLink>
          {
            !token ? (
              <div className="auth-links">
                <NavLink
                  to="/login"
                  className="nav-link login-link"
                >
                  Login
                </NavLink>

                <NavLink
                  to="/signup"
                  className="nav-link signup-link"
                >
                  Signup
                </NavLink>
              </div>
            ) : (
              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  // toast.success("Logout successfully");
                  window.location.reload();
                }}
              >
                Logout
              </button>
            )
          }
        </div>
      </div>
      {showSearch && (
        <div className="navbar-search">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
          />
        </div>
      )}
    </nav>
  );
}
