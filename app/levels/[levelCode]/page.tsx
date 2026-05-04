import { redirect } from "next/navigation";

export default async function LegacyLevelPage({
  params,
}: {
  params: Promise<{ levelCode: string }>;
}) {
  const { levelCode } = await params;
  redirect(`/learn/${levelCode.toUpperCase()}`);
}
