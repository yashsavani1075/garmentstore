import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./Profile.css";

export default function ProfileLayout() {
  return (
    <div className="profile-page">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <NavLink to="/profile/account">Account Details</NavLink>
          <NavLink to="/profile/address">My Address</NavLink>
          <NavLink to="/profile/wishlist">My Wishlist</NavLink>
          <NavLink to="/profile/orders">My Orders</NavLink>
        </aside>

        <main className="profile-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}