const Wishlist = require("../models/Wishlist");

exports.getWishlist = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const wishlist = await Wishlist.findOne({ userEmail }).populate("garments");

    if (!wishlist) {
      return res.json([]);
    }

    const formattedWishlist = wishlist.garments.map((garment) => ({
      _id: garment._id,
      garment,
    }));

    res.json(formattedWishlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { userEmail, garmentId } = req.body;

    if (!userEmail || !garmentId) {
      return res.status(400).json({ message: "Missing wishlist details" });
    }

    let wishlist = await Wishlist.findOne({ userEmail });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userEmail,
        garments: [],
      });
    }

    const alreadyExists = wishlist.garments.some(
      (id) => id.toString() === garmentId
    );

    let added = false;

    if (alreadyExists) {
      wishlist.garments = wishlist.garments.filter(
        (id) => id.toString() !== garmentId
      );
    } else {
      wishlist.garments.push(garmentId);
      added = true;
    }

    await wishlist.save();

    await wishlist.populate("garments");

    const formattedWishlist = wishlist.garments.map((garment) => ({
      _id: garment._id,
      garment,
    }));

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
    const { userEmail } = req.params;

    await Wishlist.findOneAndUpdate(
      { userEmail },
      { garments: [] }
    );

    res.json([]);
  } catch (error) {
    res.status(500).json({ message: "Failed to clear wishlist" });
  }
};