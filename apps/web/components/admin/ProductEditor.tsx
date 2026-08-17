"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { Category, Product, PrintZone, ProductVariant } from "@/lib/ecommerce/types";

function emptyVariant(): Omit<ProductVariant, "id"> {
  return { sku: "", label: "", priceDeltaCents: 0, stockQty: 0 };
}

export function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [titleEn, setTitleEn] = useState(product?.title.en ?? "");
  const [titleAr, setTitleAr] = useState(product?.title.ar ?? "");
  const [descEn, setDescEn] = useState(product?.description.en ?? "");
  const [descAr, setDescAr] = useState(product?.description.ar ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [priceDollars, setPriceDollars] = useState(product ? (product.basePriceCents / 100).toFixed(2) : "0.00");
  const [image, setImage] = useState(product?.images[0] ?? "🎁");
  const [isPersonalizable, setIsPersonalizable] = useState(product?.isPersonalizable ?? false);
  const [printZones, setPrintZones] = useState<PrintZone[]>(product?.printZones ?? []);
  const [variants, setVariants] = useState<(ProductVariant | (Omit<ProductVariant, "id"> & { id?: string }))[]>(product?.variants ?? [{ ...emptyVariant() }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addPrintZone() {
    setPrintZones((z) => [...z, { id: `zone-${z.length + 1}`, type: "text", label: "New Field", maxChars: 20 }]);
  }
  function updatePrintZone(idx: number, patch: Partial<PrintZone>) {
    setPrintZones((z) => z.map((zone, i) => (i === idx ? { ...zone, ...patch } : zone)));
  }
  function removePrintZone(idx: number) {
    setPrintZones((z) => z.filter((_, i) => i !== idx));
  }

  function addVariantRow() {
    setVariants((v) => [...v, emptyVariant()]);
  }
  function updateVariantRow(idx: number, patch: Partial<ProductVariant>) {
    setVariants((v) => v.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }
  function removeVariantRow(idx: number) {
    setVariants((v) => v.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const basePriceCents = Math.round(parseFloat(priceDollars || "0") * 100);
      if (product) {
        await adminApi.updateProduct(product.id, {
          title: { en: titleEn, ar: titleAr },
          description: { en: descEn, ar: descAr },
          slug,
          categoryId,
          basePriceCents,
          images: [image],
          isPersonalizable,
          printZones,
        });
        // Sync variants: update existing, add new ones without an id.
        for (const v of variants) {
          if ("id" in v && v.id) {
            await adminApi.updateVariant(product.id, v.id, { sku: v.sku, label: v.label, priceDeltaCents: v.priceDeltaCents, stockQty: v.stockQty });
          } else {
            await adminApi.addVariant(product.id, v);
          }
        }
      } else {
        await adminApi.createProduct({
          title: { en: titleEn, ar: titleAr },
          description: { en: descEn, ar: descAr },
          slug,
          categoryId,
          basePriceCents,
          currency: "USD",
          images: [image],
          isPersonalizable,
          printZones,
          variants: variants.map((v) => ({ ...v, id: "id" in v && v.id ? v.id : crypto.randomUUID() })),
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Delete "${product.title.en}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await adminApi.deleteProduct(product.id);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product.");
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 border-primary/30">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg text-foreground">{product ? "Edit Product" : "New Product"}</h2>
        <button onClick={onClose} className="text-sm text-muted hover:text-foreground">Close</button>
      </div>

      {error && <p className="rounded-lg bg-danger/10 p-2 text-sm text-danger">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Title (English)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input dir="auto" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="Title (Arabic)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} placeholder="Description (English)" rows={2} className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
        <textarea dir="auto" value={descAr} onChange={(e) => setDescAr(e.target.value)} placeholder="Description (Arabic)" rows={2} className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-slug" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name.en}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <span className="text-muted">Base price $</span>
          <input value={priceDollars} onChange={(e) => setPriceDollars(e.target.value)} className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </label>
        <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Emoji/icon" className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
          <input type="checkbox" checked={isPersonalizable} onChange={(e) => setIsPersonalizable(e.target.checked)} />
          Personalizable (adds print zones customers can customize)
        </label>
      </div>

      {isPersonalizable && (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Print Zones</p>
          <div className="flex flex-col gap-2">
            {printZones.map((zone, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
                <input value={zone.id} onChange={(e) => updatePrintZone(idx, { id: e.target.value })} placeholder="zone-id" className="w-28 rounded border border-border bg-background px-2 py-1 text-xs" />
                <select value={zone.type} onChange={(e) => updatePrintZone(idx, { type: e.target.value as PrintZone["type"] })} className="rounded border border-border bg-background px-2 py-1 text-xs">
                  <option value="text">text</option>
                  <option value="color">color</option>
                </select>
                <input value={zone.label} onChange={(e) => updatePrintZone(idx, { label: e.target.value })} placeholder="Label" className="w-28 rounded border border-border bg-background px-2 py-1 text-xs" />
                {zone.type === "text" ? (
                  <input
                    type="number"
                    value={zone.maxChars ?? 20}
                    onChange={(e) => updatePrintZone(idx, { maxChars: Number(e.target.value) })}
                    placeholder="max chars"
                    className="w-20 rounded border border-border bg-background px-2 py-1 text-xs"
                  />
                ) : (
                  <input
                    value={(zone.colorPalette ?? []).join(",")}
                    onChange={(e) => updatePrintZone(idx, { colorPalette: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    placeholder="#hex,#hex"
                    className="w-40 rounded border border-border bg-background px-2 py-1 text-xs"
                  />
                )}
                <button onClick={() => removePrintZone(idx)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <button onClick={addPrintZone} className="mt-2 text-xs text-primary hover:underline">+ Add print zone</button>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Variants, Prices & Inventory</p>
        <div className="flex flex-col gap-2">
          {variants.map((v, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
              <input value={v.sku} onChange={(e) => updateVariantRow(idx, { sku: e.target.value })} placeholder="SKU" className="w-24 rounded border border-border bg-background px-2 py-1 text-xs" />
              <input value={v.label} onChange={(e) => updateVariantRow(idx, { label: e.target.value })} placeholder="Label (e.g. Sage / 750ml)" className="w-40 rounded border border-border bg-background px-2 py-1 text-xs" />
              <label className="flex items-center gap-1 text-xs text-muted">
                +$
                <input
                  type="number"
                  value={v.priceDeltaCents / 100}
                  onChange={(e) => updateVariantRow(idx, { priceDeltaCents: Math.round(Number(e.target.value) * 100) })}
                  className="w-16 rounded border border-border bg-background px-2 py-1 text-xs"
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-muted">
                Stock
                <input type="number" value={v.stockQty} onChange={(e) => updateVariantRow(idx, { stockQty: Number(e.target.value) })} className="w-16 rounded border border-border bg-background px-2 py-1 text-xs" />
              </label>
              <button onClick={() => removeVariantRow(idx)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <button onClick={addVariantRow} className="mt-2 text-xs text-primary hover:underline">+ Add variant</button>
      </div>

      <div className="flex items-center justify-between">
        {product ? (
          <button onClick={handleDelete} disabled={saving} className="text-sm text-danger hover:underline disabled:opacity-50">
            Delete product
          </button>
        ) : <span />}
        <button onClick={handleSave} disabled={saving} className="rounded-pill bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </Card>
  );
}
