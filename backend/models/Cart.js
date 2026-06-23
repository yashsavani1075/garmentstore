const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    garment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garment",
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    selectedColorName: String,
    selectedColorCode: String,
    imageUrl: String,
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);