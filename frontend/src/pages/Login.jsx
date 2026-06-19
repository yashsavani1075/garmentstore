import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect } from "react";
import "./Auth.css";
import { toast } from "react-toastify";

export default function Login() {
    const [email, setEmail] = useState("");
    const { reloadCartForUser } = useCart();
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            navigate("/");
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        const res = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.message);
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        reloadCartForUser();
        toast.success("Login Successful");
        navigate("/");
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleLogin}>
                <h1>Welcome Back</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    required
                />

                <button type="submit">
                    Login
                </button>

                <div className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/signup">
                        Sign Up
                    </Link>
                </div>
            </form>
        </div>
    );
}