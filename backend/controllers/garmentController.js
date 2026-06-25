const Garment = require("../models/Garment");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

function parseArrayField(value) {
  if (!value) return [];

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value.split(",").map((item) => item.trim());
    }
  }

  if (Array.isArray(value)) return value;

  return [];
}

async function uploadFilesToCloudinary(files) {
  const uploadedUrls = [];

  for (const file of files) {
    const result = await uploadToCloudinary(file.buffer);
    uploadedUrls.push(result.secure_url);
  }

  return uploadedUrls;
}

exports.createGarment = async (req, res) => {
  try {
    const {
      title,
      price,
      discount,
      category,
      subCategory,
      dateAdded,
      color,
      fabric,
      sizes,
      sizePrices,
      colorVariants,
    } = req.body;

    const parsedSizes = parseArrayField(sizes);
    const parsedSizePrices = parseArrayField(sizePrices);
    const parsedColorVariants = parseArrayField(colorVariants);

    const files = req.files || [];

    const uploadedUrls = await uploadFilesToCloudinary(files);

    let fileIndex = 0;

    const finalColorVariants = parsedColorVariants.map((variant) => {
      const imageCount = Number(variant.imageCount || 0);

      const variantImages = uploadedUrls.slice(
        fileIndex,
        fileIndex + imageCount
      );

      fileIndex += imageCount;

      return {
        colorName: variant.colorName || "",
        colorCode: variant.colorCode || "#000000",
        imageUrl: variantImages[0] || "",
        images: variantImages,
      };
    });

    const defaultImageUrl = finalColorVariants[0]?.imageUrl || "";
    const defaultColor = finalColorVariants[0]?.colorCode || color || "";

    const garment = await Garment.create({
      title,
      price: Number(price),
      discount: Number(discount || 0),
      category,
      subCategory,
      dateAdded,
      color: defaultColor,
      fabric,
      sizes: parsedSizes,
      sizePrices: parsedSizePrices,
      imageUrl: defaultImageUrl,
      colorVariants: finalColorVariants,
    });

    res.status(201).json(garment);
  } catch (err) {
    console.error("Create garment error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getGarments = async (req, res) => {
  try {
    const garments = await Garment.find().sort({
      createdAt: -1,
    });

    res.json(garments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGarment = async (req, res) => {
  try {
    const garment = await Garment.findById(req.params.id);

    if (!garment) {
      return res.status(404).json({
        message: "Garment not found",
      });
    }

    res.json(garment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSimilarProducts = async (req, res) => {
  try {
    const garment = await Garment.findById(req.params.id);

    if (!garment) {
      return res.status(404).json({
        message: "Garment not found",
      });
    }

    const similarProducts = await Garment.find({
      category: garment.category,
      subCategory: garment.subCategory,
      _id: { $ne: garment._id },
    }).limit(4);

    res.json(similarProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGarment = async (req, res) => {
  try {
    const existingGarment = await Garment.findById(req.params.id);

    if (!existingGarment) {
      return res.status(404).json({
        message: "Garment not found",
      });
    }

    const {
      title,
      price,
      discount,
      category,
      subCategory,
      dateAdded,
      color,
      fabric,
      sizes,
      sizePrices,
      colorVariants,
    } = req.body;

    const updateData = {
      title,
      price: Number(price),
      discount: Number(discount || 0),
      category,
      subCategory,
      dateAdded,
      color,
      fabric,
      sizes: parseArrayField(sizes),
      sizePrices: parseArrayField(sizePrices),
    };

    if (colorVariants) {
      const parsedColorVariants = parseArrayField(colorVariants);
      const files = req.files || [];

      const uploadedUrls = await uploadFilesToCloudinary(files);

      let fileIndex = 0;

      const finalColorVariants = parsedColorVariants.map((variant) => {
        const imageCount = Number(variant.imageCount || 0);

        const newImages = uploadedUrls.slice(
          fileIndex,
          fileIndex + imageCount
        );

        fileIndex += imageCount;

        const oldImages = Array.isArray(variant.images)
          ? variant.images
          : [];

        const finalImages = newImages.length > 0 ? newImages : oldImages;

        return {
          colorName: variant.colorName || "",
          colorCode: variant.colorCode || "#000000",
          imageUrl: finalImages[0] || variant.imageUrl || "",
          images: finalImages,
        };
      });

      updateData.colorVariants = finalColorVariants;

      updateData.imageUrl =
        finalColorVariants[0]?.imageUrl || existingGarment.imageUrl;

      updateData.color =
        finalColorVariants[0]?.colorCode || color || existingGarment.color;
    }

    const garment = await Garment.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
    });

    res.json(garment);
  } catch (err) {
    console.error("Update garment error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGarment = async (req, res) => {
  try {
    await Garment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Garment deleted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};