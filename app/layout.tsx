import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/marketing/site-header";
import { getUser } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vocalia — European Portuguese pronunciation",
    template: "%s · Vocalia",
  },
  description:
    "Learn how European Portuguese actually sounds, from A1 to B2, with phonetic breakdowns and guided practice.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh font-sans">
        <SiteHeader signedIn={!!user} />
        {children}
      </body>
    </html>
  );
}
