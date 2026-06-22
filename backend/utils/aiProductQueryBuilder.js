function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMongoQuery(filters = {}) {
  const query = {};

  if (filters.intent === "INVALID_PROMPT") {
    return { _id: null };
  }

  if (filters.category) {
    query.category = new RegExp(`^${escapeRegex(filters.category)}$`, "i");
  }

  if (filters.subCategory) {
    query.subCategory = new RegExp(escapeRegex(filters.subCategory), "i");
  }

  if (filters.fabric) {
    query.fabric = new RegExp(escapeRegex(filters.fabric), "i");
  }

  if (filters.size) {
    const sizeRegex = new RegExp(`^${escapeRegex(filters.size)}$`, "i");

    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { sizes: sizeRegex },
        { "sizePrices.size": sizeRegex },
      ],
    });
  }

  if (filters.color) {
    const colorRegex = new RegExp(escapeRegex(filters.color), "i");

    const colorConditions = [
      { title: colorRegex },
      { color: colorRegex },
      { colorName: colorRegex },
      { "colorVariants.colorName": colorRegex },
      { "colorVariants.colorCode": colorRegex },
    ];

    if (query.$and) {
      query.$and.push({ $or: colorConditions });
    } else {
      query.$or = colorConditions;
    }
  }

  if (filters.searchTerm) {
    const searchRegex = new RegExp(escapeRegex(filters.searchTerm), "i");

    const searchConditions = [
      { title: searchRegex },
      { category: searchRegex },
      { subCategory: searchRegex },
      { fabric: searchRegex },
    ];

    if (query.$or) {
      query.$and = query.$and || [];
      query.$and.push({ $or: query.$or });
      query.$and.push({ $or: searchConditions });
      delete query.$or;
    } else {
      query.$and = query.$and || [];
      query.$and.push({ $or: searchConditions });
    }
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