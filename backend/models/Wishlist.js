const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    garment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garment",
      required: true,
    },
    size: String,
    selectedColorName: String,
    selectedColorCode: String,
    imageUrl: String,
  },
  { _id: false }
);

const wishlistSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);