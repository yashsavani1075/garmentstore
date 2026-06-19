export const getPriceBySize = (garment, selectedSize) => {
  const found = garment.sizePrices?.find(
    (item) => item.size === selectedSize
  );

  return found ? Number(found.price) : Number(garment.price);
};

export const getDiscountedPrice = (price, discount) => {
  const discountValue = Number(discount || 0);

  if (discountValue <= 0) {
    return Number(price);
  }

  return Number(price) - (Number(price) * discountValue) / 100;
};