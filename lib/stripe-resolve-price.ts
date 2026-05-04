import type Stripe from "stripe";

/**
 * Checkout line_items need a Price ID (`price_…`).
 * If `STRIPE_PRICE_ID` is a Product ID (`prod_…`), use the default one-time price or the first active one-time price.
 */
export async function resolveCheckoutPriceId(
  stripe: Stripe,
  raw: string,
): Promise<{ priceId: string } | { error: string }> {
  const id = raw.trim();
  if (!id) return { error: "Empty STRIPE_PRICE_ID" };

  if (id.startsWith("price_")) {
    return { priceId: id };
  }

  if (!id.startsWith("prod_")) {
    return {
      error:
        "STRIPE_PRICE_ID must be a Stripe Price id (price_…) or Product id (prod_…).",
    };
  }

  const product = await stripe.products.retrieve(id, {
    expand: ["default_price"],
  });

  const dp = product.default_price;
  if (dp) {
    const price: Stripe.Price =
      typeof dp === "string" ? await stripe.prices.retrieve(dp) : dp;
    if (price.type === "one_time") {
      return { priceId: price.id };
    }
    return {
      error:
        "Product default price is not one-time. Set a one-time default price on the product in Stripe, or set STRIPE_PRICE_ID to a price_… id.",
    };
  }

  const prices = await stripe.prices.list({
    product: id,
    active: true,
    limit: 20,
  });
  const oneTime = prices.data.find((p) => p.type === "one_time");
  if (!oneTime) {
    return {
      error:
        "No active one-time price found for this product. Create a one-time price in Stripe or set STRIPE_PRICE_ID to a price_… id.",
    };
  }

  return { priceId: oneTime.id };
}
