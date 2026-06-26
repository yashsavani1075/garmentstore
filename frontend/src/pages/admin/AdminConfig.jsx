import React, { useEffect, useState } from "react";
import "./AdminConfig.css";

export default function AdminConfig() {
  const [config, setConfig] = useState(null);

  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [fabric, setFabric] = useState("");
  const [size, setSize] = useState("");

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/config`);
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // CATEGORY

  const addCategory = async () => {
    if (!categoryName.trim()) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/config/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ name: categoryName }),
    });

    setCategoryName("");
    fetchConfig();
  };

  const deleteCategory = async (name) => {
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/config/category/${encodeURIComponent(name)}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    fetchConfig();
  };

  // SUBCATEGORY

  const addSubCategory = async () => {
    if (!selectedCategory || !subCategory.trim()) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/config/subcategory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({
        categoryName: selectedCategory,
        subCategory,
      }),
    });

    setSubCategory("");
    fetchConfig();
  };

  const deleteSubCategory = async (categoryName, subCategory) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/config/subcategory`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({
        categoryName,
        subCategory,
      }),
    });

    fetchConfig();
  };

  // FABRIC

  const addFabric = async () => {
    if (!fabric.trim()) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/config/fabric`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ fabric }),
    });

    setFabric("");
    fetchConfig();
  };

  const deleteFabric = async (fabricName) => {
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/config/fabric/${encodeURIComponent(
        fabricName
      )}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    fetchConfig();
  };

  // SIZE

  const addSize = async () => {
    if (!size.trim()) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/config/size`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ size }),
    });

    setSize("");
    fetchConfig();
  };

  const deleteSize = async (sizeName) => {
    await fetch(
      `${import.meta.env.VITE_API_URL}/api/config/size/${encodeURIComponent(sizeName)}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    fetchConfig();
  };

  if (!config) {
    return (
      <div className="admin-page-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h1>Product Configuration</h1>
        <p>Manage categories, subcategories, fabrics and sizes.</p>
      </div>

      {/* Categories */}
      <div className="form-card config-section">
        <h2>Categories</h2>

        <div className="config-add-row">
          <input
            type="text"
            placeholder="New Category"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />

          <button
            className="config-save-btn"
            onClick={addCategory}
          >
            Add Category
          </button>
        </div>

        <div className="config-list">
          {config.categories.map((cat) => (
            <div
              key={cat.name}
              className="config-category-card"
            >
              <div className="config-category-header">
                <span className="config-category-title">
                  {cat.name}
                </span>

                <button
                  className="config-delete-btn"
                  onClick={() =>
                    deleteCategory(cat.name)
                  }
                >
                  Delete
                </button>
              </div>

              <div className="config-subcategories">
                {cat.subCategories.map((sub) => (
                  <div
                    key={sub}
                    className="config-chip"
                  >
                    {sub}

                    <button
                      className="config-chip-delete"
                      onClick={() =>
                        deleteSubCategory(
                          cat.name,
                          sub
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Subcategory */}
      <div className="form-card config-section">
        <h2>Add Sub Category</h2>

        <div className="config-add-row">
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value)
            }
          >
            <option value="">
              Select Category
            </option>

            {config.categories.map((cat) => (
              <option
                key={cat.name}
                value={cat.name}
              >
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Sub Category"
            value={subCategory}
            onChange={(e) =>
              setSubCategory(e.target.value)
            }
          />

          <button
            className="config-save-btn"
            onClick={addSubCategory}
          >
            Add
          </button>
        </div>
      </div>

      {/* Fabrics */}
      <div className="form-card config-section">
        <h2>Fabrics</h2>

        <div className="config-add-row">
          <input
            type="text"
            placeholder="Fabric Name"
            value={fabric}
            onChange={(e) =>
              setFabric(e.target.value)
            }
          />

          <button
            className="config-save-btn"
            onClick={addFabric}
          >
            Add Fabric
          </button>
        </div>

        <div className="config-chip-group">
          {config.fabrics.map((fab) => (
            <div
              key={fab}
              className="config-chip"
            >
              {fab}

              <button
                className="config-chip-delete"
                onClick={() =>
                  deleteFabric(fab)
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="form-card config-section">
        <h2>Sizes</h2>

        <div className="config-add-row">
          <input
            type="text"
            placeholder="Size"
            value={size}
            onChange={(e) =>
              setSize(e.target.value)
            }
          />

          <button
            className="config-save-btn"
            onClick={addSize}
          >
            Add Size
          </button>
        </div>

        <div className="config-chip-group">
          {config.sizes.map((s) => (
            <div
              key={s}
              className="size-chip"
            >
              {s} <button
                className="config-chip-delete"
                onClick={() => deleteSize(s)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}