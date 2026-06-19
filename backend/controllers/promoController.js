const Promo = require("../models/PromoCode");

exports.validatePromo = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || orderAmount === undefined) {
      return res.status(400).json({
        message: "Promo code and order amount are required",
      });
    }

    const amount = Number(orderAmount);

    const promo = await Promo.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promo) {
      return res.status(404).json({
        message: "Invalid promo code",
      });
    }

    if (new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({
        message: "Promo code expired",
      });
    }

    if (amount < promo.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount should be ₹${promo.minOrderAmount}`,
      });
    }

    let discountAmount = 0;

    if (promo.discountType === "percentage") {
      discountAmount = (amount * promo.discountValue) / 100;
    } else {
      discountAmount = promo.discountValue;
    }

    // Apply max discount limit for both percentage and fixed discounts
    if (
      promo.maxDiscountAmount &&
      promo.maxDiscountAmount > 0
    ) {
      discountAmount = Math.min(
        discountAmount,
        promo.maxDiscountAmount
      );
    }

    // Prevent discount greater than order value
    discountAmount = Math.min(discountAmount, amount);

    const finalAmount = amount - discountAmount;

    res.json({
      success: true,
      message: "Promo applied successfully",
      discountAmount,
      finalAmount,
      promo: {
        _id: promo._id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.addPromo = async (req, res) => {
  try {
    const promo = await Promo.create(req.body);

    res.status(201).json({
      success: true,
      message: "Promo created successfully",
      promo,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getPromos = async (req, res) => {
  try {
    const promos = await Promo.find().sort({
      createdAt: -1,
    });

    res.json(promos);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.updatePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!promo) {
      return res.status(404).json({
        message: "Promo not found",
      });
    }

    res.json({
      success: true,
      message: "Promo updated successfully",
      promo,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deletePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndDelete(
      req.params.id
    );

    if (!promo) {
      return res.status(404).json({
        message: "Promo not found",
      });
    }

    res.json({
      success: true,
      message: "Promo deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};