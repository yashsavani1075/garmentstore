import React, { useEffect, useState } from "react";
import "./Promos.css";

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [editId, setEditId] = useState(null);

  const emptyForm = {
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    expiryDate: "",
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem("adminToken");

  const fetchPromos = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/promos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setPromos(data);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editId
      ? `${import.meta.env.VITE_API_URL}/api/promos/${editId}`
      : `${import.meta.env.VITE_API_URL}/api/promos`;

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert(editId ? "Promo updated" : "Promo added");

    setForm(emptyForm);
    setEditId(null);
    fetchPromos();
  };

  const deletePromo = async (id) => {
    if (!window.confirm("Delete this promo code?")) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/promos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchPromos();
  };

  const editPromo = (promo) => {
    setEditId(promo._id);

    setForm({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minOrderAmount: promo.minOrderAmount || "",
      maxDiscountAmount: promo.maxDiscountAmount || "",
      expiryDate: promo.expiryDate
        ? promo.expiryDate.split("T")[0]
        : "",
      isActive: promo.isActive,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  return (
    <div className="admin-promos">
      <h2>Promo Codes</h2>

      <form onSubmit={handleSubmit} className="promo-form">
        <input
          name="code"
          placeholder="Code eg. WELCOME10"
          value={form.code}
          onChange={handleChange}
          required
        />

        <select
          name="discountType"
          value={form.discountType}
          onChange={handleChange}
        >
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>

        <input
          name="discountValue"
          type="number"
          placeholder="Discount value"
          value={form.discountValue}
          onChange={handleChange}
          required
        />

        <input
          name="minOrderAmount"
          type="number"
          placeholder="Minimum order amount"
          value={form.minOrderAmount}
          onChange={handleChange}
        />

        <input
          name="maxDiscountAmount"
          type="number"
          placeholder="Max discount amount"
          value={form.maxDiscountAmount}
          onChange={handleChange}
        />

        <input
          name="expiryDate"
          type="date"
          value={form.expiryDate}
          onChange={handleChange}
          required
        />

        <label>
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          Active
        </label>

        <button type="submit">
          {editId ? "Update Promo" : "Add Promo"}
        </button>

        {editId && (
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <div className="promo-list">
        {promos.map((promo) => (
          <div key={promo._id} className="promo-card">
            <h3>{promo.code}</h3>

            <p>
              Discount:{" "}
              {promo.discountType === "percentage"
                ? `${promo.discountValue}%`
                : `₹${promo.discountValue}`}
            </p>

            <p>Min Order: ₹{promo.minOrderAmount || 0}</p>

            <p>
              Max Discount:{" "}
              {promo.maxDiscountAmount
                ? `₹${promo.maxDiscountAmount}`
                : "No limit"}
            </p>

            <p>
              Expiry: {new Date(promo.expiryDate).toLocaleDateString()}
            </p>

            <p>Status: {promo.isActive ? "Active" : "Inactive"}</p>

            <button onClick={() => editPromo(promo)}>
              Edit
            </button>

            <button onClick={() => deletePromo(promo._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}