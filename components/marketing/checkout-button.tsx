"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Native form POST so the browser can follow the 303 redirect to Stripe
 * (fetch + manual redirect often hides Location for cross-origin targets).
 */
export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const label = "Continue to checkout";

  return (
    <form
      action="/api/stripe/checkout"
      method="post"
      onSubmit={() => setLoading(true)}
    >
      <Button
        type="submit"
        variant="primary"
        className="w-full sm:w-auto"
        disabled={loading}
      >
        {loading ? "Redirecting…" : label}
      </Button>
    </form>
  );
}
