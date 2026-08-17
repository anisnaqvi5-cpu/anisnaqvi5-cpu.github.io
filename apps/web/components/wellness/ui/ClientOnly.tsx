"use client";

import { useEffect, useState } from "react";

/**
 * Wraps content that reads from the localStorage-backed Zustand store.
 * Prevents SSR/CSR markup mismatches, since the persisted state is only
 * available once the client has mounted and rehydrated from localStorage.
 */
export function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
