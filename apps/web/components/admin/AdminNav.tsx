"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Package, RotateCcw } from "lucide-react";
import { adminApi } from "@/lib/adminApi";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  async function logout() {
    await adminApi.logout();
    router.push("/admin/login");
  }

  const items = [
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-6">
        <span className="font-heading text-lg text-foreground">Admin</span>
        <nav className="flex gap-4">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 text-sm ${pathname?.startsWith(href) ? "font-medium text-primary" : "text-muted hover:text-foreground"}`}
            >
              <Icon size={15} /> {label}
            </Link>
          ))}
        </nav>
      </div>
      <button onClick={logout} className="flex items-center gap-1.5 text-sm text-muted hover:text-danger">
        <LogOut size={15} /> Logout
      </button>
    </header>
  );
}
