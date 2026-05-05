"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CheckoutButtonProps = {
  label?: string;
  className?: string;
};

/**
 * Submits a POST to `/api/stripe/checkout` so the server can return a 303 to Stripe Checkout.
 * This keeps checkout tied to the authenticated Vocalia profile.
 */
export function CheckoutButton({
  label = "Get access",
  className = "w-full sm:w-auto",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <form action="/api/stripe/checkout" method="post" onSubmit={() => setLoading(true)}>
      <Button type="submit" variant="primary" className={className} disabled={loading}>
        {loading ? "Redirecting…" : label}
      </Button>
    </form>
  );
}
