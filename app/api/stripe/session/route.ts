import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    });

    // Prepare the response data
    const sessionData = {
      id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_email,
      payment_status: session.payment_status,
      status: session.status,
      created: session.created,
      metadata: session.metadata,
      line_items: session.line_items?.data.map((item) => ({
        quantity: item.quantity,
        amount_total: item.amount_total,
        description: item.description,
        price: {
          unit_amount: item.price?.unit_amount,
          currency: item.price?.currency,
          product: {
            name:
              typeof item.price?.product === "object" &&
              item.price?.product !== null
                ? "name" in item.price.product
                  ? item.price.product.name || ""
                  : ""
                : "",
            description:
              typeof item.price?.product === "object" &&
              item.price?.product !== null
                ? "description" in item.price.product
                  ? item.price.product.description || ""
                  : ""
                : "",
          },
        },
      })),
    };

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error retrieving Stripe session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session details" },
      { status: 500 }
    );
  }
}
