import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminNavbar.css";

export default function AdminNavbar() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <nav className="admin-navbar">
      <h2>Admin Panel</h2>

      <div className="admin-nav-right">
        {admin ? (
          <>
            <span>Hello, {admin.name.toUpperCase() || "ADMIN"}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/admin/login">Login</Link>
            <Link to="/admin/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}