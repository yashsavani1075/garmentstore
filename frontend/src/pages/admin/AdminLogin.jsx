import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { toast } from "react-toastify";
import "./AdminAuth.css"

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:5000/api/admin/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message);
            return;
        }

        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("admin", JSON.stringify(data.admin));

        login(data.admin);
        toast.success("Login successful");

        navigate("/admin");
    };

    return (
        <div className="admin-auth-container">
            <div className="admin-auth-card">
                <h2>Admin Login</h2>

                <form className="admin-auth-form" onSubmit={handleLogin}>
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="admin-auth-btn">
                        Login
                    </button>
                </form>

                <div className="admin-auth-footer">
                    Don't have an account? <a href="/admin/signup">Sign Up</a>
                </div>
            </div>
        </div>
    );
}