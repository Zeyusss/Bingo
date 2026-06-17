import { getUserActivity } from "./fetch-user-activity";

type ActionType = "product_view" | "add_to_cart" | "add_to_wishlist" | "purchase";

const ACTION_WEIGHTS: Record<ActionType, number> = {
  purchase: 4,
  add_to_cart: 3,
  add_to_wishlist: 2,
  product_view: 1,
};

interface UserAction {
  productId: string;
  actionType: ActionType;
}

export const recommendProducts = async (
  userId: string,
  allProducts: any[]
): Promise<string[]> => {
  const rawActions = await getUserActivity(userId);
  const userActions: UserAction[] = Array.isArray(rawActions)
    ? (rawActions as any[]).filter(
        (a) => a?.productId && a?.actionType && ACTION_WEIGHTS[a.actionType as ActionType] !== undefined
      )
    : [];

  if (userActions.length === 0) return [];

  const interactedProductIds = new Set(userActions.map((a) => a.productId));

  const categoryScores: Record<string, number> = {};
  const shopScores: Record<string, number> = {};

  for (const action of userActions) {
    const product = allProducts.find((p) => p.id === action.productId);
    if (!product) continue;
    const weight = ACTION_WEIGHTS[action.actionType] ?? 0;
    if (product.categories) {
      for (const cat of Array.isArray(product.categories) ? product.categories : [product.categories]) {
        categoryScores[cat] = (categoryScores[cat] || 0) + weight;
      }
    }
    if (product.shopId) {
      shopScores[product.shopId] = (shopScores[product.shopId] || 0) + weight;
    }
  }

  const candidates = allProducts.filter(
    (p) => !interactedProductIds.has(p.id) && p.isDeleted !== true
  );

  const scored = candidates.map((product) => {
    let score = 0;
    if (product.categories) {
      for (const cat of Array.isArray(product.categories) ? product.categories : [product.categories]) {
        score += categoryScores[cat] || 0;
      }
    }
    if (product.shopId) {
      score += shopScores[product.shopId] || 0;
    }
    if (product.ratings) {
      score += product.ratings * 0.5;
    }
    return { id: product.id, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((p) => p.id);
};
