const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  categories: [
    {
      name: String,
      subCategories: [String],
    },
  ],
  fabrics: [String],
  sizes: [String],
});

module.exports = mongoose.model("ProductConfig", configSchema);