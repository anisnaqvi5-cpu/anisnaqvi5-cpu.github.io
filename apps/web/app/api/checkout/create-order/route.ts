import { NextResponse } from "next/server";
import { createOrder } from "@/lib/server/orderService";
import { getCustomerId, errorResponse } from "@/lib/server/http";
import { getPaymentProvider } from "@/lib/server/paymentProvider";
import { logger } from "@/lib/server/logger";
import { rateLimitOrNull } from "@/lib/server/rateLimit";
import { createOrderSchema } from "@/lib/server/validation";

export async function POST(req: Request) {
  const limited = rateLimitOrNull(req, { key: "create-order", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const customerId = getCustomerId(req);
    const body = createOrderSchema.parse(await req.json());

    const { order, clientSecret } = await createOrder({
      customerId,
      idempotencyKey: body.idempotencyKey,
      items: body.items,
      shippingAddress: body.shippingAddress,
      couponCode: body.couponCode,
    });

    logger.info("order_created", { orderId: order.id, orderNumber: order.orderNumber, customerId, totalCents: order.totalCents });
    return NextResponse.json({ order, clientSecret, provider: getPaymentProvider().name });
  } catch (err) {
    return errorResponse(err);
  }
}
