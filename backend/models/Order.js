const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  items: [
    {
      garmentId: String,
      title: String,
      price: Number,
      size: String,
      quantity: Number,

      colorName: String,
      colorCode: String,
      imageUrl: String,
    },
  ],
  totalAmount: Number,
  address: {
    fullName: String,
    phone: String,
    houseNo: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  paymentMethod: String,
  paymentId: String,
  paymentStatus: String,

  status: {
    type: String,
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
