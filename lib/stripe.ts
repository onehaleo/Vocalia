import Stripe from "stripe";
import { getStripeSecret } from "@/lib/env";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(getStripeSecret(), {
      apiVersion: "2025-08-27.basil",
      typescript: true,
    });
  }
  return stripe;
}
