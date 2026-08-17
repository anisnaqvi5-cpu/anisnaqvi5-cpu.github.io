import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/wellness/ui/Card";
import { PRODUCTS } from "@/lib/ecommerce/catalog";

// Ties the wellness tracker back into the shop, per ARCHITECTURE.md's
// "ecosystem, not just a store" goal — a real, working link rather than a
// mockup gesture.
export function HydrationBottleCrossSell() {
  const bottle = PRODUCTS.find((p) => p.id === "prod-bottle-hydrate");
  if (!bottle) return null;

  return (
    <Link href={`/shop/products/${bottle.slug}`}>
      <Card className="flex items-center gap-3 border-primary/30 bg-primary/5 transition hover:-translate-y-0.5">
        <span className="text-3xl">{bottle.images[0]}</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Get a matching hydration bottle</p>
          <p className="text-xs text-muted">Personalized with your name, from {`$${(bottle.basePriceCents / 100).toFixed(2)}`}</p>
        </div>
        <ArrowRight size={16} className="text-primary" />
      </Card>
    </Link>
  );
}
