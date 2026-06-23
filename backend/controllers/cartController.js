const Cart = require("../models/Cart");
const Garment = require("../models/Garment");

const getDiscountedPrice = (price, discount) => {
  if (!discount || discount <= 0) return price;
  return Math.round(price - (price * discount) / 100);
};

const getPriceBySize = (garment, size) => {
  const match = garment.sizePrices?.find((p) => p.size === size);
  return match ? match.price : garment.price;
};

const formatCart = async (cart) => {
  if (!cart) return [];

  await cart.populate("items.garment");

  return cart.items
    .filter((item) => item.garment)
    .map((item) => {
      const originalPrice = getPriceBySize(item.garment, item.size);
      const finalPrice = getDiscountedPrice(
        originalPrice,
        item.garment.discount
      );

      return {
        garment: {
          ...item.garment.toObject(),
          imageUrl: item.imageUrl || item.garment.imageUrl,
          selectedColorName: item.selectedColorName || "",
          selectedColorCode:
            item.selectedColorCode || item.garment.color || "",
          selectedOriginalPrice: originalPrice,
          selectedPrice: finalPrice,
        },
        size: item.size,
        quantity: item.quantity,
      };
    });
};

exports.getCart = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const cart = await Cart.findOne({ userEmail });

    const formattedCart = await formatCart(cart);

    res.json(formattedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const {
      userEmail,
      garmentId,
      size,
      selectedColorName,
      selectedColorCode,
      imageUrl,
    } = req.body;

    if (!userEmail || !garmentId || !size) {
      return res.status(400).json({ message: "Missing cart details" });
    }

    const garment = await Garment.findById(garmentId);

    if (!garment) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userEmail });

    if (!cart) {
      cart = await Cart.create({
        userEmail,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.garment.toString() === garmentId &&
        item.size === size &&
        (item.selectedColorCode || "") === (selectedColorCode || "")
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        garment: garmentId,
        size,
        selectedColorName,
        selectedColorCode,
        imageUrl,
        quantity: 1,
      });
    }

    await cart.save();

    const formattedCart = await formatCart(cart);

    res.json(formattedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { userEmail, garmentId, size, colorCode, quantity } = req.body;

    const cart = await Cart.findOne({ userEmail });

    if (!cart) {
      return res.json([]);
    }

    if (quantity < 1) {
      cart.items = cart.items.filter(
        (item) =>
          !(
            item.garment.toString() === garmentId &&
            item.size === size &&
            (item.selectedColorCode || "") === (colorCode || "")
          )
      );
    } else {
      const item = cart.items.find(
        (item) =>
          item.garment.toString() === garmentId &&
          item.size === size &&
          (item.selectedColorCode || "") === (colorCode || "")
      );

      if (item) {
        item.quantity = quantity;
      }
    }

    await cart.save();

    const formattedCart = await formatCart(cart);

    res.json(formattedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { userEmail, garmentId, size, colorCode } = req.body;

    const cart = await Cart.findOne({ userEmail });

    if (!cart) {
      return res.json([]);
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.garment.toString() === garmentId &&
          item.size === size &&
          (item.selectedColorCode || "") === (colorCode || "")
        )
    );

    await cart.save();

    const formattedCart = await formatCart(cart);

    res.json(formattedCart);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const { userEmail } = req.params;

    await Cart.findOneAndDelete({ userEmail });

    res.json([]);
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
};