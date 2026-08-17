"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/adminApi";
import type { AdminRole } from "@/lib/ecommerce/types";
import type { AdminSection } from "@/lib/server/permissions";

export interface AdminSessionInfo {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

/** Every admin page calls this with the section it represents. Redirects to
 * /admin/login if not signed in, or to /admin (dashboard) if signed in but
 * the role lacks access — the same rule the API routes enforce server-side,
 * so a hidden nav link is backed by a real 403, not just UI hiding. */
export function useAdminGuard(section: AdminSection) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState<AdminSessionInfo | null>(null);
  const [sections, setSections] = useState<AdminSection[]>([]);

  useEffect(() => {
    adminApi
      .session()
      .then((res) => {
        if (!res.authed || !res.admin) {
          router.replace("/admin/login");
          return;
        }
        if (!res.sections?.includes(section)) {
          router.replace("/admin");
          return;
        }
        setAdmin(res.admin);
        setSections(res.sections);
        setChecking(false);
      })
      .catch(() => router.replace("/admin/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  return { checking, admin, sections };
}
