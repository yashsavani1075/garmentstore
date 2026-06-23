import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Admin from "./pages/admin/Admin";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";
import Dashboard from "./pages/admin/Dashboard";
import MyOrders from "./pages/MyOrders";
import NewArrival from "./pages/NewArrival";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Kids from "./pages/Kids";
import Shopby from "./pages/Shopby";
import Cart from "./pages/Cart";
import ProductDetails from "./pages/ProductDetails";
import HotDeal from "./pages/HotDeal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useState } from "react";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Checkout from "./pages/Checkout";
import ProfileLayout from "./pages/profile/ProfileLayout";
import AccountDetails from "./pages/profile/AccountDetails";
import AddressPage from "./pages/profile/AddressPage";
import MyOrdersPage from "./pages/profile/MyOrdersPage";
import Wishlist from "./pages/Wishlist";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AiChat from "./components/AiChat";

function Layout() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && (
        <Navbar
          search={search}
          setSearch={setSearch}
        />
      )}

      <Routes>
        <Route path="/" element={<Home search={search} />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/new-arrival" element={<NewArrival />} />
        <Route path="/male" element={<Men />} />
        <Route path="/male/:subCategory" element={<Men />} />
        <Route path="/female" element={<Women />} />
        <Route path="/female/:subCategory" element={<Women />} />
        <Route path="/kids" element={<Kids />} />
        <Route path="/kids/:subCategory" element={<Kids />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/shopby" element={<Shopby />} />
        <Route path="/hot-deals" element={<HotDeal />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<ProfileLayout />}>
          <Route index element={<AccountDetails />} />
          <Route path="account" element={<AccountDetails />} />
          <Route path="address" element={<AddressPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
        </Route>
      </Routes>


      <ScrollToTopButton />
      {!isAdmin && <AiChat />}
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}