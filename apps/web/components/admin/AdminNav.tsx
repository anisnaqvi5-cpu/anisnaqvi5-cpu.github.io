"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  ClipboardList,
  CreditCard,
  FileClock,
  Heart,
  LayoutGrid,
  LogOut,
  Package,
  Palette,
  Percent,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import type { AdminSection } from "@/lib/server/permissions";
import { ROLE_LABELS } from "@/lib/server/permissions";
import type { AdminRole } from "@/lib/ecommerce/types";

const NAV_ITEMS: { section: AdminSection; href: string; label: string; icon: typeof Package }[] = [
  { section: "dashboard", href: "/admin", label: "Dashboard", icon: BarChart3 },
  { section: "products", href: "/admin/products", label: "Products", icon: ShoppingBag },
  { section: "categories", href: "/admin/categories", label: "Categories", icon: LayoutGrid },
  { section: "customization", href: "/admin/customization", label: "Customization", icon: Palette },
  { section: "orders", href: "/admin/orders", label: "Orders", icon: Package },
  { section: "payments", href: "/admin/payments", label: "Payments", icon: CreditCard },
  { section: "shipping", href: "/admin/shipping", label: "Shipping", icon: Truck },
  { section: "returns", href: "/admin/returns", label: "Returns", icon: ClipboardList },
  { section: "customers", href: "/admin/customers", label: "Customers", icon: Users },
  { section: "coupons", href: "/admin/coupons", label: "Coupons", icon: Percent },
  { section: "reviews", href: "/admin/reviews", label: "Reviews", icon: Star },
  { section: "wellness_content", href: "/admin/wellness-content", label: "Wellness Content", icon: Heart },
  { section: "notifications", href: "/admin/notifications", label: "Notifications", icon: Bell },
  { section: "admin_users", href: "/admin/users", label: "Admin Users", icon: ShieldCheck },
  { section: "audit_log", href: "/admin/audit-log", label: "Audit Log", icon: FileClock },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sections, setSections] = useState<AdminSection[] | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (pathname === "/admin/login") return;
    adminApi
      .session()
      .then((res) => {
        if (res.authed && res.sections && res.admin) {
          setSections(res.sections);
          setRole(res.admin.role);
          setName(res.admin.name);
        }
      })
      .catch(() => undefined);
  }, [pathname]);

  if (pathname === "/admin/login") return null;

  async function logout() {
    await adminApi.logout();
    router.push("/admin/login");
  }

  const items = NAV_ITEMS.filter((item) => sections?.includes(item.section));

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <span className="font-heading text-lg text-foreground">Admin</span>
        <div className="flex items-center gap-3">
          {role && (
            <span className="hidden text-xs text-muted sm:inline">
              {name} · <span className="font-medium text-primary">{ROLE_LABELS[role]}</span>
            </span>
          )}
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-muted hover:text-danger">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <nav className="fixed left-0 top-[57px] bottom-0 z-20 hidden w-56 flex-col gap-0.5 overflow-y-auto border-r border-border bg-surface/60 p-3 sm:flex">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-primary/10 font-medium text-primary" : "text-muted hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile nav — condensed, horizontally scrollable */}
      <nav className="sticky top-[57px] z-20 flex gap-1 overflow-x-auto border-b border-border bg-surface/60 px-2 py-2 sm:hidden">
        {items.map(({ href, label }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-pill border px-3 py-1 text-xs ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
