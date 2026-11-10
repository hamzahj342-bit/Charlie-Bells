/** DECIMAL fields often arrive as strings — compare as numbers. */
export const toMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const hasDiscount = (product) => {
  const price = toMoney(product?.price);
  const discount = toMoney(product?.discount_price);
  return discount > 0 && price > 0 && discount < price;
};

export const effectivePrice = (product) =>
  hasDiscount(product) ? toMoney(product.discount_price) : toMoney(product.price);

export const discountPercent = (product) => {
  if (!hasDiscount(product)) return 0;
  const price = toMoney(product.price);
  const discount = toMoney(product.discount_price);
  return Math.round(((price - discount) / price) * 100);
};

export const formatMoney = (value) => `$${toMoney(value).toFixed(2)}`;
