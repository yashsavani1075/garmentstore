const Wishlist = require("../models/Wishlist");
const User = require("../models/User");

const formatWishlist = async (wishlist) => {
  if (!wishlist) return [];

  await wishlist.populate("items.garment");

  return wishlist.items
    .filter((item) => item.garment)
    .map((item) => ({
      _id: item.garment._id,
      garment: item.garment,
      size: item.size,
      selectedColorName: item.selectedColorName,
      selectedColorCode: item.selectedColorCode,
      imageUrl: item.imageUrl,
    }));
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const userEmail = user.email;

    const wishlist = await Wishlist.findOne({ userEmail });

    const formattedWishlist = await formatWishlist(wishlist);

    res.json(formattedWishlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const {
      garmentId,
      size,
      selectedColorName,
      selectedColorCode,
      imageUrl,
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const userEmail = user.email;

    if (!userEmail || !garmentId) {
      return res.status(400).json({ message: "Missing wishlist details" });
    }

    let wishlist = await Wishlist.findOne({ userEmail });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userEmail,
        items: [],
      });
    }

    const existingItem = wishlist.items.find(
      (item) =>
        item.garment.toString() === garmentId &&
        item.size === size &&
        (item.selectedColorCode || "") === (selectedColorCode || ""),
    );

    let added = false;

    if (existingItem) {
      wishlist.items = wishlist.items.filter(
        (item) =>
          !(
            item.garment.toString() === garmentId &&
            item.size === size &&
            (item.selectedColorCode || "") === (selectedColorCode || "")
          ),
      );
    } else {
      wishlist.items.push({
        garment: garmentId,
        size,
        selectedColorName,
        selectedColorCode,
        imageUrl,
      });

      added = true;
    }

    await wishlist.save();

    const formattedWishlist = await formatWishlist(wishlist);

    res.json({
      added,
      wishlist: formattedWishlist,
      message: added ? "Added to wishlist" : "Removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update wishlist" });
  }
};

exports.clearWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const userEmail = user.email;

    await Wishlist.findOneAndUpdate({ userEmail }, { items: [] });

    res.json([]);
  } catch (error) {
    res.status(500).json({ message: "Failed to clear wishlist" });
  }
};
