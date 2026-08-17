import type { Metadata } from "next";
import { ShopNav } from "@/components/shop/ShopNav";

export const metadata: Metadata = {
  title: {
    default: "Shop",
    template: "%s | Wellness Shop",
  },
  description: "Shop personalized wellness products — customize colors, engravings and bundles, then track your order.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <ShopNav />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:pb-10 sm:pl-64 sm:pr-6">{children}</main>
    </div>
  );
}
