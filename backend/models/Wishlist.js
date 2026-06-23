const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      unique: true,
    },

    garments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Garment",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);