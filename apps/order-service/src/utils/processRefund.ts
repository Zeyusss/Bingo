import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

/**
 * Processes a refund for a cancelled order.
 * Abstracted to support multiple payment providers.
 * When Paymob is integrated, add a case for paymentMethod === "paymob".
 */
export const processRefund = async (order: {
  id: string;
  paymentMethod: string | null;
  paymentIntentId: string | null;
  total: number;
}): Promise<{ refunded: boolean; message: string }> => {
  const method = order.paymentMethod?.toLowerCase() ?? "";

  if (method === "cod" || method === "cash_on_delivery") {
    return { refunded: false, message: "COD order — no payment to refund." };
  }

  if (method === "paymob") {
    // TODO: implement Paymob refund when Paymob is integrated
    return {
      refunded: false,
      message: "Paymob refund not yet implemented — process manually.",
    };
  }

  // Default: Stripe
  if (!order.paymentIntentId) {
    return {
      refunded: false,
      message:
        "No paymentIntentId on record — process refund manually in Stripe dashboard.",
    };
  }

  await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
  });

  return { refunded: true, message: "Stripe refund issued successfully." };
};
