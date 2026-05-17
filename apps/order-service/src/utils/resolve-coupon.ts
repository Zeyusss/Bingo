import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import type { ResolvedCartLine } from "./resolve-cart-pricing";

export interface ValidatedCoupon {
  code: string;
  discount: number;
  discountAmount: number;
  discountType: string;
  discountedProductId: string;
  /** Percentage value when discountType is "percentage"; otherwise 0 */
  discountPercent: number;
}

/**
 * Validate coupon against DB + resolved cart (DB prices).
 * NOTE: discount_codes has no validFrom/validUntil — add expiry via schema migration when ready.
 */
export async function resolveCouponFromDb(
  couponCode: string,
  resolvedCart: ResolvedCartLine[],
): Promise<ValidatedCoupon> {
  const code = couponCode.trim();
  if (!code) {
    throw new ValidationError("Coupon code is required.");
  }

  const discount = await prisma.discount_codes.findUnique({
    where: { discountCode: code },
  });

  if (!discount) {
    throw new ValidationError("Coupon code isn't valid!");
  }

  const shopIds = [...new Set(resolvedCart.map((item) => item.shopId))];
  const shops = await prisma.shops.findMany({
    where: { id: { in: shopIds } },
    select: { id: true, sellerId: true },
  });
  const sellerIdByShopId = new Map(shops.map((s) => [s.id, s.sellerId]));

  const matchingProduct = resolvedCart.find(
    (item) =>
      item.discount_codes.includes(discount.id) &&
      sellerIdByShopId.get(item.shopId) === discount.sellerId,
  );

  if (!matchingProduct) {
    throw new ValidationError(
      "No eligible product in cart for this coupon, or coupon does not belong to this shop.",
    );
  }

  const lineTotal = matchingProduct.sale_price * matchingProduct.quantity;
  let discountAmount = 0;

  if (discount.discountType === "percentage") {
    discountAmount = (lineTotal * discount.discountValue) / 100;
  } else if (discount.discountType === "flat") {
    discountAmount = discount.discountValue;
  } else {
    throw new ValidationError("Invalid coupon type.");
  }

  discountAmount = Math.min(discountAmount, lineTotal);

  return {
    code: discount.discountCode,
    discount: discount.discountValue,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountType: discount.discountType,
    discountedProductId: matchingProduct.id,
    discountPercent:
      discount.discountType === "percentage" ? discount.discountValue : 0,
  };
}
