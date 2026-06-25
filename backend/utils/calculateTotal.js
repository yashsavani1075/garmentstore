const Garment = require("../models/Garment");
const Promo = require("../models/PromoCode");

const calculateTotal = async (items, promoCode) => {
  let totalAmount = 0;

  if (!items || !Array.isArray(items)) return 0;

  for (const item of items) {
    const garmentId = item.garmentId || (item.garment && item.garment._id);
    if (!garmentId) continue;

    const garment = await Garment.findById(garmentId);
    if (!garment) continue;

    const sizeMatch = garment.sizePrices?.find((p) => p.size === item.size);
    const originalPrice = sizeMatch ? sizeMatch.price : garment.price;

    const finalPrice = garment.discount 
      ? Math.round(originalPrice - (originalPrice * garment.discount) / 100)
      : originalPrice;

    totalAmount += finalPrice * (item.quantity || 1);
  }

  if (promoCode) {
    const promo = await Promo.findOne({ code: promoCode.toUpperCase(), isActive: true });
    if (promo && new Date(promo.expiryDate) >= new Date() && totalAmount >= promo.minOrderAmount) {
      let discountAmount = promo.discountType === "percentage" 
        ? (totalAmount * promo.discountValue) / 100 
        : promo.discountValue;

      if (promo.maxDiscountAmount && promo.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, promo.maxDiscountAmount);
      }
      discountAmount = Math.min(discountAmount, totalAmount);
      totalAmount -= discountAmount;
    }
  }

  return Math.max(0, totalAmount);
};

module.exports = calculateTotal;
