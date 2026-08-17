import type { Category, Coupon, Product } from "@/lib/ecommerce/types";

// Shared by client components AND server API routes (no browser-only APIs
// here) so price/stock/print-zone rules are computed identically on both
// sides — the server never trusts a client-submitted price.

export const CATEGORIES: Category[] = [
  { id: "cat-mats", slug: "yoga-mats", name: { en: "Yoga Mats", ar: "سجادات اليوغا" }, tagline: { en: "Personalized grip & calm", ar: "قبضة ثابتة وهدوء شخصي" } },
  { id: "cat-trackers", slug: "fitness-trackers", name: { en: "Fitness Trackers & Planners", ar: "أجهزة ومخططات اللياقة" }, tagline: { en: "Plan it, track it", ar: "خطط لها وتتبعها" } },
  { id: "cat-diffusers", slug: "diffusers", name: { en: "Essential Oil Diffusers", ar: "مبخرات الزيوت العطرية" }, tagline: { en: "A calmer room in minutes", ar: "غرفة أهدأ في دقائق" } },
  { id: "cat-gum", slug: "motivational-gum", name: { en: "Motivational Gum Bags", ar: "أكياس علكة تحفيزية" }, tagline: { en: "A little nudge, every pack", ar: "دفعة صغيرة في كل عبوة" } },
  { id: "cat-journals", slug: "journals", name: { en: "Gratitude Journals", ar: "دفاتر الامتنان" }, tagline: { en: "Write it down daily", ar: "دوّنها يوميًا" } },
  { id: "cat-bottles", slug: "water-bottles", name: { en: "Hydration Bottles", ar: "زجاجات الترطيب" }, tagline: { en: "Track every sip", ar: "تتبع كل رشفة" } },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-mat-flow",
    slug: "flow-yoga-mat",
    categoryId: "cat-mats",
    title: { en: "Flow Personalized Yoga Mat", ar: "سجادة يوغا فلو الشخصية" },
    description: {
      en: "A premium non-slip mat with your name and a color pattern printed on the surface.",
      ar: "سجادة فاخرة مانعة للانزلاق مطبوع عليها اسمك ونمط لوني.",
    },
    basePriceCents: 4900,
    currency: "USD",
    images: ["🧘"],
    isPersonalizable: true,
    printZones: [
      { id: "mat-name", type: "text", label: "Name", maxChars: 20, fonts: ["Inter", "Fraunces"] },
      { id: "mat-color", type: "color", label: "Pattern color", colorPalette: ["#7A9471", "#C97C5D", "#1F2420", "#6B8AA6"] },
    ],
    variants: [
      { id: "var-mat-standard", sku: "MAT-STD", label: "Standard (4mm)", priceDeltaCents: 0, stockQty: 42 },
      { id: "var-mat-thick", sku: "MAT-THK", label: "Extra Thick (6mm)", priceDeltaCents: 800, stockQty: 17 },
    ],
    avgRating: 4.6,
    reviewCount: 3,
  },
  {
    id: "prod-tracker-planner",
    slug: "custom-fitness-planner",
    categoryId: "cat-trackers",
    title: { en: "Custom Fitness Planner", ar: "مخطط لياقة مخصص" },
    description: {
      en: "A weekly planner cover embossed with your name, in your goal color.",
      ar: "غلاف مخطط أسبوعي محفور باسمك بلون هدفك.",
    },
    basePriceCents: 2400,
    currency: "USD",
    images: ["📘"],
    isPersonalizable: true,
    printZones: [
      { id: "planner-name", type: "text", label: "Name", maxChars: 18 },
      { id: "planner-color", type: "color", label: "Cover color", colorPalette: ["#C97C5D", "#7A9471", "#1F2420"] },
    ],
    variants: [{ id: "var-planner-std", sku: "PLN-STD", label: "Standard", priceDeltaCents: 0, stockQty: 60 }],
    avgRating: 4.8,
    reviewCount: 2,
  },
  {
    id: "prod-diffuser-calm",
    slug: "calm-oil-diffuser",
    categoryId: "cat-diffusers",
    title: { en: "Calm Essential Oil Diffuser", ar: "مبخرة الزيوت العطرية الهادئة" },
    description: { en: "Ceramic diffuser with a soft ambient glow.", ar: "مبخرة سيراميك بإضاءة محيطية ناعمة." },
    basePriceCents: 3900,
    currency: "USD",
    images: ["🕯️"],
    isPersonalizable: false,
    printZones: [],
    variants: [
      { id: "var-diff-white", sku: "DIF-WHT", label: "Cloud White", priceDeltaCents: 0, stockQty: 25 },
      { id: "var-diff-sage", sku: "DIF-SAGE", label: "Sage Green", priceDeltaCents: 0, stockQty: 19 },
    ],
    avgRating: 4.4,
    reviewCount: 1,
  },
  {
    id: "prod-gum-motivate",
    slug: "motivational-gum-bag",
    categoryId: "cat-gum",
    title: { en: "Motivational Gum Bag", ar: "كيس علكة تحفيزية" },
    description: { en: "Sugar-free gum with a custom motivational message on the bag.", ar: "علكة خالية من السكر برسالة تحفيزية مخصصة على الكيس." },
    basePriceCents: 900,
    currency: "USD",
    images: ["💬"],
    isPersonalizable: true,
    printZones: [{ id: "gum-message", type: "text", label: "Message", maxChars: 40 }],
    variants: [{ id: "var-gum-mint", sku: "GUM-MINT", label: "Mint", priceDeltaCents: 0, stockQty: 120 }],
    avgRating: 4.2,
    reviewCount: 4,
  },
  {
    id: "prod-journal-gratitude",
    slug: "gratitude-journal",
    categoryId: "cat-journals",
    title: { en: "Gratitude Journal", ar: "دفتر الامتنان" },
    description: { en: "A guided daily journal with your name on the cover.", ar: "دفتر يومي موجه باسمك على الغلاف." },
    basePriceCents: 2200,
    currency: "USD",
    images: ["📓"],
    isPersonalizable: true,
    printZones: [{ id: "journal-name", type: "text", label: "Name", maxChars: 20 }],
    variants: [{ id: "var-journal-std", sku: "JRN-STD", label: "Standard", priceDeltaCents: 0, stockQty: 80 }],
    avgRating: 4.9,
    reviewCount: 5,
  },
  {
    id: "prod-bottle-hydrate",
    slug: "hydration-bottle",
    categoryId: "cat-bottles",
    title: { en: "Hydration Tracking Bottle", ar: "زجاجة تتبع الترطيب" },
    description: { en: "A time-marked bottle with your name printed on the wrap.", ar: "زجاجة بعلامات زمنية واسمك مطبوع عليها." },
    basePriceCents: 1900,
    currency: "USD",
    images: ["💧"],
    isPersonalizable: true,
    printZones: [
      { id: "bottle-name", type: "text", label: "Name", maxChars: 16 },
      { id: "bottle-color", type: "color", label: "Bottle color", colorPalette: ["#6B8AA6", "#7A9471", "#C97C5D"] },
    ],
    variants: [
      { id: "var-bottle-750", sku: "BTL-750", label: "750ml", priceDeltaCents: 0, stockQty: 50 },
      { id: "var-bottle-1000", sku: "BTL-1000", label: "1000ml", priceDeltaCents: 300, stockQty: 30 },
    ],
    avgRating: 4.7,
    reviewCount: 6,
  },
];

export const COUPONS: Coupon[] = [
  { code: "WELCOME10", type: "percentage", value: 10 },
  { code: "FREESHIP", type: "free_shipping", value: 0 },
  { code: "SAVE5", type: "fixed_amount", value: 500, minOrderCents: 3000 },
];

export const SHIPPING_FEE_CENTS = 500;

export function findProduct(productId: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === productId);
}

export function findVariant(productId: string, variantId: string): { product: Product; variant: Product["variants"][number] } | undefined {
  const product = findProduct(productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || !variant) return undefined;
  return { product, variant };
}

export function findProductByVariantId(variantId: string): { product: Product; variant: Product["variants"][number] } | undefined {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function findCoupon(code: string): Coupon | undefined {
  return COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
}
