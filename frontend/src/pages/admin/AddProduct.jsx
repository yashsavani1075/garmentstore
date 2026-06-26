import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import './AddProduct.css';

export default function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sizePrices, setSizePrices] = useState({});
  const [colorVariants, setColorVariants] = useState([
    {
      colorName: "Default",
      colorCode: "#710400",
      images: [],
      previews: [],
    },
  ]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/config`)
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories);
        setFabrics(data.fabrics);
        setSizes(data.sizes);
      });
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    discount: '',
    photo: null,
    photoPreview: '',
    category: '',
    subCategory: '',
    dateAdded: new Date().toISOString().split('T')[0],
    color: '#710400',
    fabric: '',
    sizes: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setFormData(prev => ({ ...prev, category: value, subCategory: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSizeChange = (size) => {
    if (formData.sizes.includes(size)) {
      setFormData({
        ...formData,
        sizes: formData.sizes.filter((s) => s !== size),
      });

      const updated = { ...sizePrices };
      delete updated[size];
      setSizePrices(updated);
    } else {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, size],
      });

      setSizePrices({
        ...sizePrices,
        [size]: formData.price || "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalSizePrices = formData.sizes.map((size) => ({
        size,
        price: Number(sizePrices[size] || formData.price),
      }));
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('price', formData.price);
      submitData.append('dateAdded', formData.dateAdded);
      submitData.append('category', formData.category);
      submitData.append('subCategory', formData.subCategory);
      submitData.append('fabric', formData.fabric);
      submitData.append('color', formData.color);
      submitData.append('sizes', JSON.stringify(formData.sizes));
      submitData.append('sizePrices', JSON.stringify(finalSizePrices));
      submitData.append('discount', formData.discount);
      // send color variant information
      submitData.append(
        "colorVariants",
        JSON.stringify(
          colorVariants.map((variant) => ({
            colorName: variant.colorName,
            colorCode: variant.colorCode,
            imageCount: variant.images.length,
          }))
        )
      );

      // upload all images
      colorVariants.forEach((variant) => {
        variant.images.forEach((image) => {
          submitData.append("photos", image);
        });
      });

      const adminToken = localStorage.getItem("adminToken");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/garments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`
        },
        body: submitData
      });

      if (response.ok) {
        toast.success('Garment added successfully!');
        setFormData({
          title: '',
          price: '',
          discount: '',
          photo: null,
          photoPreview: '',
          category: '',
          subCategory: '',
          dateAdded: new Date().toISOString().split('T')[0],
          color: '#710400',
          fabric: '',
          sizes: []
        });
        setSizePrices({});
        setColorVariants([
          {
            colorName: "Default",
            colorCode: "#710400",
            images: [],
            previews: [],
          },
        ]);
      } else {
        toast.error('Failed to add garment');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('An error occurred. Make sure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleVariantChange = (index, field, value) => {
    const updated = [...colorVariants];
    updated[index][field] = value;
    setColorVariants(updated);
  };

  const handleVariantImages = (index, files) => {
    if (!files || files.length === 0) return;

    const updated = [...colorVariants];

    const newFiles = Array.from(files);

    updated[index].images = [
      ...updated[index].images,
      ...newFiles,
    ];

    updated[index].previews = [
      ...updated[index].previews,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ];

    setColorVariants(updated);
  };

  const addColorVariant = () => {
    setColorVariants([
      ...colorVariants,
      {
        colorName: "",
        colorCode: "#000000",
        images: [],
        previews: [],
      },
    ]);
  };
  const removeColorVariant = (index) => {
    if (colorVariants.length === 1) return;

    setColorVariants(
      colorVariants.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h1>Add New Garment</h1>
        <p>Fill in the details to add a new product to your inventory.</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="garment-form">
          <div className="form-section full-width">
            <label className="section-label">
              Product Color Variants
            </label>

            {colorVariants.map((variant, index) => (
              <div
                key={index}
                className="color-variant-card"
              >
                <div className="form-row">

                  <div className="form-group">
                    <label>Color Name</label>
                    <input
                      type="text"
                      value={variant.colorName}
                      placeholder="e.g. Red"
                      onChange={(e) =>
                        handleVariantChange(
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
                        handleVariantChange(
                          index,
                          "colorCode",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="photo-upload-container">
                  <label className="photo-upload-box">
                    <span>+ Add Images</span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) =>
                        handleVariantImages(index, e.target.files)
                      }
                    />
                  </label>

                  {variant.previews.length > 0 && (
                    <div className="variant-preview-grid">
                      {variant.previews.map((preview, i) => (
                        <div key={i} className="preview-wrapper">
                          <img
                            src={preview}
                            alt=""
                            className="photo-preview"
                          />

                          <button
                            type="button"
                            className="remove-photo-btn"
                            onClick={() => {
                              const updated = [...colorVariants];
                              updated[index].images.splice(i, 1);
                              updated[index].previews.splice(i, 1);
                              setColorVariants(updated);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {colorVariants.length > 1 && (
                  <button
                    type="button"
                    className="remove-color-btn"
                    onClick={() =>
                      removeColorVariant(index)
                    }
                  >
                    Remove Color
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="add-color-btn"
              onClick={addColorVariant}
            >
              + Add Another Color
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Product Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Classic White Shirt"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 1000 ₹"
                min="0"
                step="1"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="discount">
                Discount (%)
              </label>

              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="e.g. 20"
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateAdded">Date Added</label>
              <input
                type="date"
                id="dateAdded"
                name="dateAdded"
                value={formData.dateAdded}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subCategory">Sub-Category</label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                disabled={!formData.category}
                required
              >
                <option value="">Select Sub-Category</option>
                {categories
                  .find(c => c.name === formData.category)
                  ?.subCategories.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fabric">Fabric</label>
              <select id="fabric" name="fabric" value={formData.fabric} onChange={handleChange} required>
                <option value="">Select Fabric</option>
                {fabrics.map(fab => (
                  <option key={fab} value={fab}>
                    {fab}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="color">Primary Color</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
                <span className="color-value">{formData.color}</span>
              </div>
            </div>
          </div>

          <div className="form-section full-width">
            <label className="section-label">Available Sizes</label>
            <div className="sizes-container">
              {sizes.map(size => (
                <button
                  key={size}
                  type="button"
                  className={`size-chip ${formData.sizes.includes(size) ? 'selected' : ''}`}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            {formData.sizes.length > 0 && (
              <div className="size-price-box">
                <h3>Size Wise Prices</h3>

                {formData.sizes.map((size) => (
                  <div className="size-price-row" key={size}>
                    <label>{size}</label>

                    <input
                      type="number"
                      placeholder={`Price for ${size}`}
                      value={sizePrices[size] || ""}
                      onChange={(e) =>
                        setSizePrices({
                          ...sizePrices,
                          [size]: e.target.value,
                        })
                      }
                      min="0"
                      required
                    />
                  </div>
                ))}
              </div>
            )}
            {formData.sizes.length === 0 && <span className="error-text">Please select at least one size</span>}

          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={isSubmitting || formData.sizes.length === 0}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Adding...
                </>
              ) : 'Add Garment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}