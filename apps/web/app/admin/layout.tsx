import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:pl-64 sm:pr-6">{children}</main>
    </div>
  );
}
