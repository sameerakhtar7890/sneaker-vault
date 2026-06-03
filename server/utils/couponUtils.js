export function calcSubtotal(items = []) {
  return items.reduce((sum, i) => sum + Number(i.price) * Number(i.qty || 1), 0);
}

export function applyCoupon(coupon, subtotal) {
  if (subtotal <= 0) throw new Error('Cart is empty');

  if (!coupon.isActive) throw new Error('This promo code is no longer active');
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new Error('This promo code has expired');
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('This promo code has reached its usage limit');
  }
  if (subtotal < (coupon.minOrderAmount || 0)) {
    throw new Error(`Minimum order of $${coupon.minOrderAmount.toFixed(2)} required for this code`);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percent') {
    discountAmount = subtotal * (coupon.discountValue / 100);
    if (coupon.maxDiscount != null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  const total = Math.round((subtotal - discountAmount) * 100) / 100;
  if (total < 0.5) throw new Error('Discount exceeds cart total');

  return { subtotal, discountAmount, total, couponCode: coupon.code };
}
