"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Package, ShoppingCart, Store } from "lucide-react";
import { useShopStore } from "@/lib/shopStore";
import { LanguageToggle } from "@/components/wellness/Nav/LanguageToggle";

const NAV_ITEMS = [
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/shop/wishlist", label: "Wishlist", icon: Heart },
  { href: "/shop/cart", label: "Cart", icon: ShoppingCart },
  { href: "/shop/orders", label: "Orders", icon: Package },
];

export function ShopNav() {
  const pathname = usePathname();
  const cartCount = useShopStore((s) => s.cartItems.reduce((sum, c) => sum + c.quantity, 0));

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <Link href="/shop" className="font-heading text-lg text-foreground">
          Wellness Shop
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link href="/wellness" className="hidden rounded-pill border border-border px-3 py-1.5 text-xs text-muted hover:bg-primary/5 sm:inline-flex">
            <Home size={14} className="mr-1 inline" /> Wellness
          </Link>
          <Link href="/shop/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface hover:bg-primary/10">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-surface/95 px-1 py-1.5 backdrop-blur sm:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] transition ${active ? "text-primary" : "text-muted"}`}>
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      <nav className="fixed left-0 top-[57px] bottom-0 z-20 hidden w-56 flex-col gap-1 border-r border-border bg-surface/60 p-3 sm:flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-primary/10 font-medium text-primary" : "text-muted hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
