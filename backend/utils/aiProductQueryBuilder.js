function buildMongoQuery(filters = {}) {
  const query = {};

  if (filters.category) {
    query.category = new RegExp(`^${filters.category}$`, "i");
  }

  if (filters.subCategory) {
    query.subCategory = new RegExp(filters.subCategory, "i");
  }

  if (filters.fabric) {
    query.fabric = new RegExp(filters.fabric, "i");
  }

  if (filters.color) {
    query.$or = [
      { color: new RegExp(filters.color, "i") },
      { colorName: new RegExp(filters.color, "i") },
      { "colorVariants.colorName": new RegExp(filters.color, "i") },
      { "colorVariants.colorCode": new RegExp(filters.color, "i") },
    ];
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};

    if (filters.minPrice) {
      query.price.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice) {
      query.price.$lte = Number(filters.maxPrice);
    }
  }

  if (filters.discountOnly) {
    query.discount = { $gt: 0 };
  }

  return query;
}

function getSortOption(sort) {
  if (sort === "CHEAPEST") return { price: 1 };
  if (sort === "EXPENSIVE") return { price: -1 };
  if (sort === "NEWEST") return { createdAt: -1 };
  if (sort === "DISCOUNT") return { discount: -1 };

  return { createdAt: -1 };
}

module.exports = {
  buildMongoQuery,
  getSortOption,
};