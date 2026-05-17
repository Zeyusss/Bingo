import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";

export interface CartLineInput {
  id: string;
  quantity?: number;
  selectedOptions?: Record<string, unknown>;
  personalizationData?: unknown;
}

export interface ResolvedCartLine {
  id: string;
  title: string;
  shopId: string;
  quantity: number;
  sale_price: number;
  regular_price: number;
  discount_codes: string[];
  selectedOptions: Record<string, unknown>;
  personalizationData: unknown;
}

function unitPrice(product: {
  sale_price: number | null;
  regular_price: number;
}): number {
  return product.sale_price ?? product.regular_price;
}

/** Replace client prices with DB prices; keep qty / options / personalization from request. */
export async function resolveCartFromDb(
  cartInput: CartLineInput[],
): Promise<{ cart: ResolvedCartLine[]; subtotal: number }> {
  if (!Array.isArray(cartInput) || cartInput.length === 0) {
    throw new ValidationError("Cart is empty or invalid.");
  }

  const productIds = [
    ...new Set(
      cartInput
        .map((item) => item?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];

  if (productIds.length !== cartInput.length) {
    throw new ValidationError("Each cart item must include a valid product id.");
  }

  const products = await prisma.products.findMany({
    where: {
      id: { in: productIds },
      isDeleted: { not: true },
      status: "Active",
    },
    select: {
      id: true,
      title: true,
      shopId: true,
      stock: true,
      sale_price: true,
      regular_price: true,
      discount_codes: true,
    },
  });

  const productById = new Map(products.map((p) => [p.id, p]));
  const resolved: ResolvedCartLine[] = [];

  for (const item of cartInput) {
    const product = productById.get(item.id);
    if (!product) {
      throw new ValidationError(
        `Product ${item.id} is unavailable or does not exist.`,
      );
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ValidationError(`Invalid quantity for product ${product.title}.`);
    }
    if (product.stock < quantity) {
      throw new ValidationError(
        `Insufficient stock for ${product.title}. Only ${product.stock} available.`,
      );
    }

    const price = unitPrice(product);
    resolved.push({
      id: product.id,
      title: product.title,
      shopId: product.shopId,
      quantity,
      sale_price: price,
      regular_price: product.regular_price,
      discount_codes: product.discount_codes,
      selectedOptions:
        item.selectedOptions && typeof item.selectedOptions === "object"
          ? item.selectedOptions
          : {},
      personalizationData: item.personalizationData ?? null,
    });
  }

  const subtotal = resolved.reduce(
    (sum, line) => sum + line.quantity * line.sale_price,
    0,
  );

  return { cart: resolved, subtotal };
}

export function serializeCartForSessionCompare(cart: ResolvedCartLine[]): string {
  return JSON.stringify(
    cart
      .map((item) => ({
        id: item.id,
        quantity: item.quantity,
        sale_price: item.sale_price,
        shopId: item.shopId,
        selectedOptions: item.selectedOptions,
        personalizationData: item.personalizationData,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
}
