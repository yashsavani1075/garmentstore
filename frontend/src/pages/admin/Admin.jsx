import React, { useState } from "react";
import Sidebar from "./Sidebar";
import AddProduct from "./AddProduct";
import ShowProducts from "./ShowProducts";
import Orders from "./Orders";
import AdminConfig from "./AdminConfig";
import Promos from "./Promos";
import AdminNavbar from "../../components/admin/AdminNavbar";
import "./Admin.css";

export default function Admin() {
  const [activePage, setActivePage] = useState("add-product");

  const renderPage = () => {
  switch (activePage) {
    case "admin-config":
      return <AdminConfig />;

    case "add-product":
      return <AddProduct />;

    case "show-products":
      return <ShowProducts />;

    case "orders":
      return <Orders />;

    case "admin-promos":
      return <Promos />;

    default:
      return <AddProduct />;
  }
};

  return (
    <div className="admin-layout">
      <AdminNavbar />

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="admin-main">
        {renderPage()}
      </div>
    </div>
  );
}