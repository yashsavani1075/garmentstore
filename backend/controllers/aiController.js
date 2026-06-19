const Garment = require("../models/Garment");
const extractFiltersWithAI = require("../utils/aiFilterExtractor");

const {
  buildMongoQuery,
  getSortOption,
} = require("../utils/aiProductQueryBuilder");

function getDiscountedPrice(price, discount) {
  if (!discount || discount <= 0) return price;
  return Math.round(price - (price * discount) / 100);
}

function getDisplayColor(product) {
  if (product.colorVariants?.length > 0) {
    const firstVariant = product.colorVariants[0];

    if (firstVariant.colorName && firstVariant.colorName !== "Default") {
      return firstVariant.colorName;
    }

    if (firstVariant.colorCode) {
      return firstVariant.colorCode;
    }
  }

  return product.colorName || product.color || "N/A";
}

function cleanProducts(products) {
  return products.map((product) => ({
    _id: product._id,
    title: product.title,
    price: product.price,
    discount: product.discount || 0,
    finalPrice: getDiscountedPrice(product.price, product.discount),
    category: product.category,
    subCategory: product.subCategory,
    fabric: product.fabric,
    color: product.color,
    colorName: product.colorName || null,
    displayColor: getDisplayColor(product),
    colorVariants: product.colorVariants || [],
    sizes: product.sizes || [],
    sizePrices: product.sizePrices || [],
    imageUrl: product.imageUrl,
  }));
}

function formatProductReply(products) {
  if (!products.length) {
    return "Sorry, this product is currently not available.";
  }

  return `I found ${products.length} matching product${
    products.length > 1 ? "s" : ""
  } for you. You can view any product from below.`;
}

function getSelectedProduct(products, position) {
  if (!products.length) return null;

  const index = position ? position - 1 : 0;

  if (index < 0 || index >= products.length) {
    return null;
  }

  return products[index];
}

exports.askAI = async (req, res) => {
  try {
    const { message, lastProducts = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const filters = await extractFiltersWithAI(message);
    // console.log("USER MESSAGE:", message);
    // console.log("AI FILTERS:", filters);

    if (filters.intent === "VIEW_PRODUCT" && lastProducts.length > 0) {
      const selectedProduct = getSelectedProduct(
        lastProducts,
        filters.productPosition,
      );

      if (!selectedProduct) {
        return res.status(200).json({
          success: true,
          reply: "Please select a valid product number.",
          filters,
          count: 0,
          products: [],
          action: "INVALID_SELECTION",
        });
      }

      return res.status(200).json({
        success: true,
        reply: `Opening ${selectedProduct.title}.`,
        filters,
        count: 1,
        products: [],
        selectedProduct,
        action: "VIEW_PRODUCT",
        navigateTo: `/product/${selectedProduct._id}`,
      });
    }

    if (filters.intent === "TRACK_ORDER") {
      return res.status(200).json({
        success: true,
        reply: "Please open your profile page to view your latest orders.",
        filters,
        count: 0,
        products: [],
        action: "TRACK_ORDER",
        navigateTo: "/profile/orders",
      });
    }

    const query = buildMongoQuery(filters);
    // console.log("MONGO QUERY:", query);
    const sortOption = getSortOption(filters.sort);

    const productsFromDB = await Garment.find(query)
      .sort(sortOption)
      .limit(8)
      .lean();

    const products = cleanProducts(productsFromDB);
    const reply = formatProductReply(products);

    return res.status(200).json({
      success: true,
      reply,
      filters,
      count: products.length,
      products,
      action: products.length ? "SHOW_PRODUCTS" : "NO_PRODUCTS",
    });
  } catch (error) {
    console.log("AI chatbot error:", error);

    return res.status(500).json({
      success: false,
      message: "Chatbot error",
    });
  }
};

exports.getChatSuggestions = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      suggestions: [
        "Show me cotton shirts under ₹1000",
        "Show black shirts for men",
        "Show sarees on discount",
        "Show cheapest t-shirts",
        "Show kids clothes",
        "Show women kurtis",
        "Open first product",
        "Track my order",
      ],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Suggestion error",
    });
  }
};
