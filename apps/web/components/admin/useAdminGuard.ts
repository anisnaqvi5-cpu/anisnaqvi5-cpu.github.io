"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/adminApi";

export function useAdminGuard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    adminApi
      .session()
      .then((res) => {
        if (!res.authed) router.replace("/admin/login");
        else setChecking(false);
      })
      .catch(() => router.replace("/admin/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { checking };
}
