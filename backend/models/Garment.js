const mongoose = require("mongoose");

const colorVariantSchema = new mongoose.Schema(
  {
    colorName: String,
    colorCode: String,

    imageUrl: String,

    images: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const garmentSchema = new mongoose.Schema({
  title: String,
  price: Number,

  discount: {
    type: Number,
    default: 0,
  },

  category: String,
  subCategory: String,
  dateAdded: String,

  color: String,

  fabric: String,
  sizes: [String],

  sizePrices: [
    {
      size: String,
      price: Number,
    },
  ],

  imageUrl: String,

  colorVariants: {
    type: [colorVariantSchema],
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Garment", garmentSchema);