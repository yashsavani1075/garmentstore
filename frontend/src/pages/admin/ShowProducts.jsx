import React, { useEffect, useState } from "react";
import './ShowProducts.css';
import { toast } from "react-toastify";

export default function ShowProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [config, setConfig] = useState(null);
  const [editSizePrices, setEditSizePrices] = useState({});
  const [editColorVariants, setEditColorVariants] = useState([]);

  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    discount: "",
    category: "",
    subCategory: "",
    fabric: "",
    color: "#4f46e5",
    sizes: []
  });

  const openEdit = (product) => {
    setEditingProduct(product);

    setEditForm({
      title: product.title || "",
      price: product.price || "",
      discount: product.discount || "",
      category: product.category || "",
      subCategory: product.subCategory || "",
      fabric: product.fabric || "",
      color: product.color || "#4f46e5",
      sizes: product.sizes || []
    });

    const priceObj = {};

    product.sizePrices?.forEach((item) => {
      priceObj[item.size] = item.price;
    });

    setEditSizePrices(priceObj);
    const variants =
      product.colorVariants && product.colorVariants.length > 0
        ? product.colorVariants.map((variant) => ({
          colorName: variant.colorName || "",
          colorCode: variant.colorCode || "#000000",
          imageUrl: variant.imageUrl || "",
          images: variant.images?.length
            ? variant.images
            : variant.imageUrl
              ? [variant.imageUrl]
              : [],
          newImages: [],
          previews: variant.images?.length
            ? variant.images
            : variant.imageUrl
              ? [variant.imageUrl]
              : [],
        }))
        : [
          {
            colorName: "Default",
            colorCode: product.color || "#000000",
            imageUrl: product.imageUrl || "",
            images: product.imageUrl ? [product.imageUrl] : [],
            newImages: [],
            previews: product.imageUrl ? [product.imageUrl] : [],
          },
        ];

    setEditColorVariants(variants);
  };

  const handleEditSizeToggle = (size) => {
    if (editForm.sizes.includes(size)) {
      setEditForm({
        ...editForm,
        sizes: editForm.sizes.filter((s) => s !== size)
      });

      const updated = { ...editSizePrices };
      delete updated[size];
      setEditSizePrices(updated);
    } else {
      setEditForm({
        ...editForm,
        sizes: [...editForm.sizes, size]
      });

      setEditSizePrices({
        ...editSizePrices,
        [size]: editForm.price || ""
      });
    }
  };
  const handleEditVariantChange = (index, field, value) => {
    const updated = [...editColorVariants];
    updated[index][field] = value;
    setEditColorVariants(updated);
  };

  const handleEditVariantImages = (index, files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const updated = [...editColorVariants];

    updated[index].newImages = [
      ...(updated[index].newImages || []),
      ...fileArray,
    ];

    updated[index].previews = [
      ...(updated[index].previews || []),
      ...fileArray.map((file) => URL.createObjectURL(file)),
    ];

    setEditColorVariants(updated);
  };

  const addEditColorVariant = () => {
    setEditColorVariants([
      ...editColorVariants,
      {
        colorName: "",
        colorCode: "#000000",
        imageUrl: "",
        images: [],
        newImages: [],
        previews: [],
      },
    ]);
  };

  const removeEditColorVariant = (index) => {
    if (editColorVariants.length === 1) return;

    setEditColorVariants(
      editColorVariants.filter((_, i) => i !== index)
    );
  };

  const saveEdit = async () => {
    try {
      const finalSizePrices = editForm.sizes.map((size) => ({
        size,
        price: Number(editSizePrices[size] || editForm.price),
      }));

      const submitData = new FormData();

      submitData.append("title", editForm.title);
      submitData.append("price", editForm.price);
      submitData.append("discount", editForm.discount || 0);
      submitData.append("category", editForm.category);
      submitData.append("subCategory", editForm.subCategory);
      submitData.append("fabric", editForm.fabric);
      submitData.append("color", editForm.color);
      submitData.append("sizes", JSON.stringify(editForm.sizes));
      submitData.append("sizePrices", JSON.stringify(finalSizePrices));

      submitData.append(
        "colorVariants",
        JSON.stringify(
          editColorVariants.map((variant) => ({
            colorName: variant.colorName,
            colorCode: variant.colorCode,
            imageUrl: variant.imageUrl,
            images: variant.images || [],
            imageCount: variant.newImages?.length || 0,
          }))
        )
      );

      editColorVariants.forEach((variant) => {
        variant.newImages?.forEach((image) => {
          submitData.append("photos", image);
        });
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/garments/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: submitData,
        }
      );

      if (response.ok) {
        toast.success("Product updated");

        setEditingProduct(null);
        setEditSizePrices({});
        setEditColorVariants([]);

        fetchProducts();
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/garments`
      );

      const data = await response.json();

      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/config`
      );

      const data = await res.json();

      setConfig(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchConfig();
  }, []);

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/garments/${id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      if (response.ok) {
        fetchProducts();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>Loading Products...</h2>;
  }

  return (
    <div>
      <h2>All Products</h2>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="search-products"
      />

      <table className="product-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Title</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Category</th>
            <th>Fabric</th>
            <th>Sizes</th>
            <th>Date Added</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.filter((item) =>
            item.title
              .toLowerCase()
              .includes(search.toLowerCase())
          ).map((item) => (
            <tr key={item._id}>
              <td>
                <div className="product-thumb-box">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="product-thumb"
                  />

                  <div className="admin-color-dots">
                    {item.colorVariants?.map((variant, index) => (
                      <span
                        key={index}
                        className="admin-color-dot"
                        style={{
                          backgroundColor: variant.colorCode,
                        }}
                        title={variant.colorName}
                      ></span>
                    ))}
                  </div>
                </div>
              </td>

              <td>{item.title}</td>

              <td>₹{item.price}</td>
              <td>{item.discount || 0}%</td>


              <td>
                {item.category}
                <br />
                <small>{item.subCategory}</small>
              </td>

              <td>{item.fabric}</td>

              <td>
                {Array.isArray(item.sizes)
                  ? item.sizes.map((s) => {
                    const priceObj = item.sizePrices?.find(
                      (p) => p.size === s
                    );

                    return (
                      <div key={s}>
                        {s}: ₹{priceObj?.price || item.price}
                      </div>
                    );
                  })
                  : item.sizes}
              </td>

              <td>
                {new Date(
                  item.dateAdded
                ).toLocaleDateString()}
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    className="edit-btn"
                    onClick={() => openEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteProduct(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingProduct && config && (
        <div className="modal-overlay">
          <div className="modal large-modal">

            <h2>Edit Product</h2>

            <div className="form-group">
              <label>Title</label>

              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    title: e.target.value
                  })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price</label>

                <input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: e.target.value
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Discount</label>

                <input
                  type="number"
                  value={editForm.discount}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      discount: e.target.value
                    })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>

                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      category: e.target.value,
                      subCategory: ""
                    })
                  }
                >
                  <option value="">
                    Select Category
                  </option>

                  {config?.categories?.map(cat => (
                    <option
                      key={cat.name}
                      value={cat.name}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sub Category</label>

                <select
                  value={editForm.subCategory}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      subCategory: e.target.value
                    })
                  }
                >
                  <option value="">
                    Select Sub Category
                  </option>

                  {config?.categories
                    ?.find(
                      c => c.name === editForm.category
                    )
                    ?.subCategories?.map(sub => (
                      <option
                        key={sub}
                        value={sub}
                      >
                        {sub}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fabric</label>

                <select
                  value={editForm.fabric}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      fabric: e.target.value
                    })
                  }
                >
                  <option value="">
                    Select Fabric
                  </option>

                  {config?.fabrics?.map(fabric => (
                    <option
                      key={fabric}
                      value={fabric}
                    >
                      {fabric}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>

                <input
                  type="color"
                  value={editForm.color}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      color: e.target.value
                    })
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label>Color Variants</label>

              {editColorVariants.map((variant, index) => (
                <div className="edit-color-variant-card" key={index}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Color Name</label>
                      <input
                        type="text"
                        value={variant.colorName}
                        placeholder="e.g. Red"
                        onChange={(e) =>
                          handleEditVariantChange(
                            index,
                            "colorName",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Color</label>
                      <input
                        type="color"
                        value={variant.colorCode}
                        onChange={(e) =>
                          handleEditVariantChange(
                            index,
                            "colorCode",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="edit-variant-image-box">
                    <label className="photo-upload-box">
                      + Add Product Views

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) =>
                          handleEditVariantImages(index, e.target.files)
                        }
                      />
                    </label>

                    {variant.previews?.length > 0 ? (
                      <div className="edit-preview-grid">
                        {variant.previews.map((preview, imgIndex) => (
                          <div className="edit-preview-wrapper" key={imgIndex}>
                            <img
                              src={preview}
                              alt={variant.colorName}
                              className="edit-variant-preview"
                            />

                            <button
                              type="button"
                              className="remove-photo-btn"
                              onClick={() => {
                                const updated = [...editColorVariants];

                                updated[index].previews.splice(imgIndex, 1);

                                if (imgIndex < updated[index].images.length) {
                                  updated[index].images.splice(imgIndex, 1);
                                } else {
                                  const newImageIndex =
                                    imgIndex - updated[index].images.length;

                                  updated[index].newImages.splice(newImageIndex, 1);
                                }

                                setEditColorVariants(updated);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-variant-image">
                        No Image
                      </div>
                    )}
                  </div>

                  {editColorVariants.length > 1 && (
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        removeEditColorVariant(index)
                      }
                    >
                      Remove Color
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="edit-btn"
                onClick={addEditColorVariant}
              >
                + Add Color
              </button>
            </div>
            <div className="form-group">
              <label>Sizes</label>

              <div className="sizes-container">
                {config?.sizes?.map(size => (
                  <button
                    key={size}
                    type="button"
                    className={`size-chip ${editForm.sizes.includes(size)
                      ? "selected"
                      : ""
                      }`}
                    onClick={() =>
                      handleEditSizeToggle(size)
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
              {editForm.sizes.length > 0 && (
                <div className="size-price-box">
                  <h3>Size Wise Prices</h3>

                  {editForm.sizes.map((size) => (
                    <div className="size-price-row" key={size}>
                      <label>{size}</label>

                      <input
                        type="number"
                        value={editSizePrices[size] || ""}
                        placeholder={`Price for ${size}`}
                        onChange={(e) =>
                          setEditSizePrices({
                            ...editSizePrices,
                            [size]: e.target.value,
                          })
                        }
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="submit-btn"
                onClick={saveEdit}
              >
                Save Changes
              </button>

              <button
                className="delete-btn"
                onClick={() =>
                  setEditingProduct(null)
                }
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}