import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { toast } from "react-toastify";
import "./AdminAuth.css";

export default function AdminSignup() {
    const navigate = useNavigate();
    const { login } = useAdminAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        adminSecret: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword ||
            !formData.adminSecret
        ) {
            toast.error("Please fill all fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch(
                "http://localhost:5000/api/admin/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        adminSecret: formData.adminSecret,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Signup failed");
                return;
            }

            // Save JWT token
            localStorage.setItem("adminToken", data.token);

            // Save admin details
            localStorage.setItem(
                "admin",
                JSON.stringify(data.admin)
            );

            // Update Auth Context
            login(data.admin);

            toast.success("Signup successful!");
            navigate("/admin");
        } catch (error) {
            console.error(error);
            toast.error("Server error. Please try again.");
        }
    };

    return (
        <div className="admin-auth-container">
            <div className="admin-auth-card">
                <h2>Admin Signup</h2>

                <form className="admin-auth-form" onSubmit={handleSubmit}>
                    <div>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Admin Secret Key</label>
                        <input
                            type="password"
                            name="adminSecret"
                            placeholder="Enter admin secret key"
                            value={formData.adminSecret}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="admin-auth-btn">
                        Sign Up
                    </button>
                </form>

                <div className="admin-auth-footer">
                    Already have an account?{" "}
                    <Link to="/admin/login">Login</Link>
                </div>
            </div>
        </div>
    );
}