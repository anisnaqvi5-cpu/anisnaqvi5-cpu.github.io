import { z } from "zod";

// Runtime request-body schemas for the highest-risk endpoints (auth, money,
// content that becomes publicly visible). TypeScript's `as T` casts elsewhere
// in the API layer only affect compile-time checking — they do nothing to
// stop a malformed or malicious request body at runtime. These schemas do.
// See PRODUCTION_READINESS.md "API validation" for the rollout plan across
// the remaining routes not yet covered here.

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(150),
  phone: z.string().trim().min(1).max(30),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(60),
  postalCode: z.string().trim().max(20).optional(),
});

const designElementSchema = z.object({
  zoneId: z.string().trim().min(1).max(80),
  type: z.enum(["text", "color"]),
  value: z.string().max(500),
});

const orderItemInputSchema = z.object({
  variantId: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(50),
  design: z
    .object({
      productId: z.string().trim().min(1),
      elements: z.array(designElementSchema).max(20),
    })
    .optional(),
});

export const createOrderSchema = z.object({
  idempotencyKey: z.string().trim().min(1).max(200),
  items: z.array(orderItemInputSchema).min(1).max(50),
  shippingAddress: addressSchema,
  couponCode: z.string().trim().max(40).optional(),
});

export const simulatePaymentSchema = z.object({
  paymentIntentId: z.string().trim().min(1),
  outcome: z.enum(["succeed", "decline"]),
});

export const previewTotalsSchema = z.object({
  items: z.array(orderItemInputSchema).min(1).max(50),
  couponCode: z.string().trim().max(40).optional(),
});

export const returnRequestSchema = z.object({
  orderItemId: z.string().trim().min(1),
  reason: z.string().trim().max(500),
});

export const reviewCreateSchema = z.object({
  productId: z.string().trim().min(1),
  orderItemId: z.string().trim().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  comment: z.string().trim().max(2000),
});

const localizedTextSchema = z.object({ en: z.string().trim().min(1).max(300), ar: z.string().trim().max(300) });

const printZoneSchema = z.object({
  id: z.string().trim().min(1).max(80),
  type: z.enum(["text", "color"]),
  label: z.string().trim().min(1).max(100),
  maxChars: z.number().int().min(1).max(500).optional(),
  colorPalette: z.array(z.string().trim().max(20)).max(20).optional(),
  fonts: z.array(z.string().trim().max(60)).max(20).optional(),
});

const variantSchema = z.object({
  id: z.string().trim().min(1),
  sku: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(150),
  priceDeltaCents: z.number().int().min(-1_000_000).max(1_000_000),
  stockQty: z.number().int().min(0).max(1_000_000),
});

export const productCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  categoryId: z.string().trim().min(1),
  title: localizedTextSchema,
  description: z.object({ en: z.string().trim().max(2000), ar: z.string().trim().max(2000) }),
  basePriceCents: z.number().int().min(0).max(100_000_00),
  currency: z.literal("USD"),
  images: z.array(z.string().trim().max(20)).min(1).max(10),
  isPersonalizable: z.boolean(),
  printZones: z.array(printZoneSchema).max(20),
  variants: z.array(variantSchema).min(1).max(30),
});

export const productUpdateSchema = productCreateSchema.partial().omit({ variants: true });

export const categoryCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  name: localizedTextSchema,
  tagline: z.object({ en: z.string().trim().max(200), ar: z.string().trim().max(200) }),
});

export const couponCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Coupon code must be alphanumeric."),
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  value: z.number().min(0).max(1_000_000),
  minOrderCents: z.number().int().min(0).max(100_000_00).optional(),
});

export const adminUserCreateSchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(1).max(150),
  password: z.string().min(10).max(200),
  role: z.enum(["super_admin", "product_manager", "order_manager", "content_manager"]),
});
