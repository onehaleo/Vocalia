"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <form
      action="/api/stripe/checkout"
      method="post"
      onSubmit={() => setLoading(true)}
    >
      <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={loading}>
        {loading ? "Redirecting…" : "Get access with Stripe"}
      </Button>
    </form>
  );
}
