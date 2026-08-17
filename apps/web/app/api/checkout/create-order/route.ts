import { NextResponse } from "next/server";
import { createOrder } from "@/lib/server/orderService";
import { getCustomerId, errorResponse } from "@/lib/server/http";
import { getPaymentProvider } from "@/lib/server/paymentProvider";
import type { CreateOrderRequest } from "@/lib/ecommerce/types";

export async function POST(req: Request) {
  try {
    const customerId = getCustomerId(req);
    const body = (await req.json()) as CreateOrderRequest;

    if (!body.idempotencyKey) {
      return NextResponse.json({ error: "missing_idempotency_key", message: "idempotencyKey is required." }, { status: 400 });
    }

    const { order, clientSecret } = await createOrder({
      customerId,
      idempotencyKey: body.idempotencyKey,
      items: body.items,
      shippingAddress: body.shippingAddress,
      couponCode: body.couponCode,
    });

    return NextResponse.json({ order, clientSecret, provider: getPaymentProvider().name });
  } catch (err) {
    return errorResponse(err);
  }
}
