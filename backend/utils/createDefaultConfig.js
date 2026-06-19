const ProductConfig = require("../models/ProductConfig");

const createDefaultConfig = async () => {
  const existing = await ProductConfig.findOne();

  if (!existing) {
    await ProductConfig.create({
      categories: [
        {
          name: "Male",
          subCategories: ["Shirt", "T-Shirt"],
        },
        {
          name: "Female",
          subCategories: [
            "Kurti",
            "Saree",
            "Top",
            "Salwar Kameez",
            "Salwar Suit & Gown",
          ],
        },
        {
          name: "Kids",
          subCategories: ["Lengha Choli"],
        },
      ],

      fabrics: [
        "Cotton",
        "Silk",
        "Linen",
        "Polyester",
        "Denim",
        "Wool",
        "Rayon",
      ],

      sizes: [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "XXL",
        "3XL",
      ],
    });

    console.log("Default config created");
  }
};

module.exports = createDefaultConfig;