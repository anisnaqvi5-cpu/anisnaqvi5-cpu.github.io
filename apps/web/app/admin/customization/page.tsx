"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { FontRecord, QuoteRecord } from "@/lib/ecommerce/types";

function FontsPanel() {
  const [fonts, setFonts] = useState<FontRecord[]>([]);
  const [name, setName] = useState("");
  const [cssFamily, setCssFamily] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await adminApi.listFonts();
    setFonts(res.fonts);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !cssFamily) return;
    await adminApi.createFont({ name, cssFamily, isActive: true });
    setName("");
    setCssFamily("");
    await load();
  }

  async function toggle(f: FontRecord) {
    await adminApi.updateFont(f.id, { isActive: !f.isActive });
    await load();
  }

  async function remove(id: string) {
    await adminApi.deleteFont(id);
    await load();
  }

  if (loading) return null;

  return (
    <Card>
      <h2 className="mb-3 font-heading text-base text-foreground">Fonts</h2>
      <form onSubmit={add} className="mb-3 flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input value={cssFamily} onChange={(e) => setCssFamily(e.target.value)} placeholder="CSS font-family" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add</button>
      </form>
      <ul className="flex flex-col gap-2">
        {fonts.map((f) => (
          <li key={f.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
            <span style={{ fontFamily: f.cssFamily }}>{f.name} — Aa</span>
            <div className="flex items-center gap-3">
              <button onClick={() => toggle(f)} className={`rounded-pill px-2 py-0.5 text-xs ${f.isActive ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted"}`}>
                {f.isActive ? "Active" : "Inactive"}
              </button>
              <button onClick={() => remove(f.id)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function QuotesPanel() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [textEn, setTextEn] = useState("");
  const [textAr, setTextAr] = useState("");
  const [category, setCategory] = useState<QuoteRecord["category"]>("motivational");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await adminApi.listQuotes();
    setQuotes(res.quotes);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!textEn) return;
    await adminApi.createQuote({ text: { en: textEn, ar: textAr }, category, isActive: true });
    setTextEn("");
    setTextAr("");
    await load();
  }

  async function remove(id: string) {
    await adminApi.deleteQuote(id);
    await load();
  }

  if (loading) return null;

  return (
    <Card>
      <h2 className="mb-3 font-heading text-base text-foreground">Quotes (for print zones / gum bag messages)</h2>
      <form onSubmit={add} className="mb-3 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <input value={textEn} onChange={(e) => setTextEn(e.target.value)} placeholder="Quote (English)" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={category} onChange={(e) => setCategory(e.target.value as QuoteRecord["category"])} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="motivational">Motivational</option>
            <option value="gratitude">Gratitude</option>
          </select>
        </div>
        <input dir="auto" value={textAr} onChange={(e) => setTextAr(e.target.value)} placeholder="Quote (Arabic)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button className="self-start rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add</button>
      </form>
      <ul className="flex flex-col gap-2">
        {quotes.map((q) => (
          <li key={q.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
            <div>
              <p className="text-foreground">{q.text.en}</p>
              <p className="text-xs text-muted">{q.category}</p>
            </div>
            <button onClick={() => remove(q.id)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function DesignsPanel() {
  const [designs, setDesigns] = useState<{ orderItem: { id: string; productTitle: string; designSnapshot: { zoneId: string; value: string }[] | null }; orderNumber: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listDesigns().then((r) => setDesigns(r.designs as never)).finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <Card>
      <h2 className="mb-1 font-heading text-base text-foreground">Ordered Designs</h2>
      <p className="mb-3 text-xs text-muted">
        Read-only — the designs customers actually ordered (frozen at order time). Unordered drafts stay private/browser-local by design.
      </p>
      {designs.length === 0 ? (
        <p className="text-sm text-muted">No personalized orders yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {designs.map((d) => (
            <li key={d.orderItem.id} className="rounded-lg border border-border p-2 text-sm">
              <p className="text-foreground">{d.orderItem.productTitle} — {d.orderNumber}</p>
              <p className="text-xs text-primary">{(d.orderItem.designSnapshot ?? []).map((e) => `${e.zoneId}=${e.value}`).join(", ")}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function AdminCustomizationContent() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Customization Library</h1>
      <FontsPanel />
      <QuotesPanel />
      <DesignsPanel />
    </div>
  );
}

export default function AdminCustomizationPage() {
  const { checking } = useAdminGuard("customization");
  if (checking) return <DashboardSkeleton />;
  return <AdminCustomizationContent />;
}
