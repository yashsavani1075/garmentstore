import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AddressPage() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [loading, setLoading] = useState(false);

  const getEmptyForm = () => ({
    type: "",
    name: user?.name || "",
    email: user?.email || "",
    mobile: "",
    flatNo: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
  });

  const [addressForm, setAddressForm] = useState(getEmptyForm());

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, []);

  if (!user) {
    return <h2>Please login to view addresses</h2>;
  }

  const getToken = () => localStorage.getItem("token");

  const loadAddresses = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/addresses`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setAddresses(data);
      } else {
        setAddresses([]);
        console.error(data);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAddressForm(getEmptyForm());
    setEditAddressId(null);
    setShowAddressForm(false);
  };

  const validateAddress = () => {
    if (
      !addressForm.type.trim() ||
      !addressForm.name.trim() ||
      !addressForm.email.trim() ||
      !addressForm.mobile.trim() ||
      !addressForm.address.trim() ||
      !addressForm.country.trim() ||
      !addressForm.state.trim() ||
      !addressForm.city.trim() ||
      !addressForm.pincode.trim()
    ) {
      toast.error("Please fill all required fields");
      return false;
    }

    return true;
  };

  const saveAddress = async () => {
    if (!validateAddress()) return;

    try {
      const isEditing = Boolean(editAddressId);

      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/users/addresses/${editAddressId}`
        : `${import.meta.env.VITE_API_URL}/api/users/addresses`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save address");
        return;
      }

      if (Array.isArray(data)) {
        setAddresses(data);
      } else {
        await loadAddresses();
      }

      resetForm();
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error("Something went wrong while saving address");
    }
  };

  const deleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/addresses/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete address");
        return;
      }

      await loadAddresses();
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error("Something went wrong while deleting address");
    }
  };

  const editAddress = (addr) => {
    setAddressForm({
      type: addr.type || "",
      name: addr.name || "",
      email: addr.email || "",
      mobile: addr.mobile || "",
      flatNo: addr.flatNo || "",
      address: addr.address || "",
      country: addr.country || "",
      state: addr.state || "",
      city: addr.city || "",
      pincode: addr.pincode || "",
    });

    setEditAddressId(addr._id);
    setShowAddressForm(true);
  };

  return (
    <div className="address-section">
      <div className="address-top">
        <h2>MY ADDRESSES</h2>

        <button
          className="add-address-main-btn"
          onClick={() => {
            setAddressForm(getEmptyForm());
            setEditAddressId(null);
            setShowAddressForm(true);
          }}
        >
          ADD ADDRESS +
        </button>
      </div>

      {loading ? (
        <p>Loading addresses...</p>
      ) : (
        <div className="address-card-grid">
          {addresses.length === 0 ? (
            <p>No address saved yet.</p>
          ) : (
            addresses.map((addr) => (
              <div className="profile-address-card" key={addr._id}>
                <h3>{addr.type}</h3>

                <p>
                  <b>Name :</b> {addr.name}
                </p>

                <p>
                  <b>Email :</b> {addr.email}
                </p>

                <p>
                  <b>Mobile :</b> {addr.mobile}
                </p>

                <p>
                  <b>Address :</b>{" "}
                  {addr.flatNo && `${addr.flatNo}, `}
                  {addr.address}, {addr.city}, {addr.state}, {addr.country} -{" "}
                  {addr.pincode}
                </p>

                <div className="address-actions">
                  <button onClick={() => editAddress(addr)}>Edit</button>
                  <button onClick={() => deleteAddress(addr._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showAddressForm && (
        <div className="address-modal-overlay">
          <div className="address-modal">
            <button className="address-close-btn" onClick={resetForm}>
              ×
            </button>

            <h2>{editAddressId ? "UPDATE ADDRESS" : "ADDRESS"}</h2>

            <div className="modal-line"></div>

            <label>ADDRESS TYPE</label>
            <select
              value={addressForm.type}
              onChange={(e) =>
                setAddressForm({ ...addressForm, type: e.target.value })
              }
            >
              <option value="">Select an Address Type</option>
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>

            <div className="form-row">
              <div>
                <label>FULL NAME</label>
                <input
                  type="text"
                  placeholder="FULL NAME"
                  value={addressForm.name}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label>EMAIL</label>
                <input
                  type="email"
                  placeholder="EMAIL"
                  value={addressForm.email}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>MOBILE</label>
                <input
                  type="text"
                  placeholder="MOBILE NUMBER"
                  value={addressForm.mobile}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, mobile: e.target.value })
                  }
                />
              </div>

              <div>
                <label>FLAT NO</label>
                <input
                  type="text"
                  placeholder="FLAT NO"
                  value={addressForm.flatNo}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, flatNo: e.target.value })
                  }
                />
              </div>
            </div>

            <label>ADDRESS</label>
            <textarea
              placeholder="ADDRESS"
              value={addressForm.address}
              onChange={(e) =>
                setAddressForm({ ...addressForm, address: e.target.value })
              }
            />

            <div className="form-row">
              <div>
                <label>COUNTRY</label>
                <select
                  value={addressForm.country}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, country: e.target.value })
                  }
                >
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                </select>
              </div>

              <div>
                <label>STATE</label>
                <select
                  value={addressForm.state}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, state: e.target.value })
                  }
                >
                  <option value="">Select State</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>CITY</label>
                <input
                  type="text"
                  placeholder="CITY"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                />
              </div>

              <div>
                <label>PINCODE</label>
                <input
                  type="text"
                  placeholder="PINCODE"
                  value={addressForm.pincode}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, pincode: e.target.value })
                  }
                />
              </div>
            </div>

            <button className="modal-add-btn" onClick={saveAddress}>
              {editAddressId ? "UPDATE ADDRESS" : "ADD ADDRESS"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}