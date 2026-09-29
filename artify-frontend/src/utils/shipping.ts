export const FLAT_SHIPPING_FEE = 150;
export const FREE_SHIPPING_THRESHOLD = 5000;

export const estimateShipping = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;