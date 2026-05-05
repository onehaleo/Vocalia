import { redirect } from "next/navigation";
import { marketingUrl } from "@/lib/site";

export default async function PricingPage() {
  redirect(marketingUrl("/#pricing"));
}
