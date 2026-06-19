import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section">
          <h2>Website</h2>
          <p>
            Discover the latest fashion trends for Men, Women, and Kids.
            Quality garments at affordable prices.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/new-arrival">New Arrivals</Link>
          <Link to="/shopby">Shop By</Link>
          <Link to="/hot-deals">Hot Deals</Link>
        </div>

        <div className="footer-section">
          <h3>Categories</h3>
          <Link to="/men">Men</Link>
          <Link to="/women">Women</Link>
          <Link to="/kids">Kids</Link>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: support@website.com</p>
          <p>Phone: +91 12345 67890</p>
          <p>Surat, Gujarat</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Website. All Rights Reserved.</p>
      </div>
    </footer>
  );
}