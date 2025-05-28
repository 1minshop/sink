import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/db/order-actions";
import { z } from "zod";

const checkoutSchema = z.object({
  teamId: z.number(),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        price: z.string(),
        currency: z.string(),
      })
    )
    .min(1, "At least one item is required"),
  totalAmount: z.string(),
  currency: z.string(),
  paymentMethod: z.enum(["stripe", "qr_code"]).default("qr_code"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = checkoutSchema.parse(body);

    // Create the order with payment method
    const order = await createOrder({
      ...validatedData,
      paymentMethod: validatedData.paymentMethod,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Order created successfully",
      paymentMethod: validatedData.paymentMethod,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
