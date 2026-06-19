const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  type: String,
  name: String,
  email: String,
  mobile: String,
  flatNo: String,
  address: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
  
  addresses: [addressSchema],
});

module.exports = mongoose.model("User", userSchema);