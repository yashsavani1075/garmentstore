import React, { useState } from "react";
import { toast } from "react-toastify";

export default function AccountDetails() {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  const user = storedUser ? JSON.parse(storedUser) : null;

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [loading, setLoading] = useState(false);

  if (!user) {
    return <h2>Please login to view account details</h2>;
  }

  const updateDetails = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update profile");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Account details updated");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-section">
      <h2>ACCOUNT DETAILS</h2>

      <div className="account-form">
        <div className="account-row">
          <div>
            <label>FULL NAME</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div>
            <label>EMAIL</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>
        </div>

        <button onClick={updateDetails} disabled={loading}>
          {loading ? "UPDATING..." : "UPDATE DETAILS"}
        </button>
      </div>
    </div>
  );
}