import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { z } from "zod";

const stripeCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        price: z.string(),
        currency: z.string(),
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .min(1, "At least one item is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  contactNumber: z.string().min(1, "Contact number is required"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  totalAmount: z.string(),
  currency: z.string(),
  teamId: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = stripeCheckoutSchema.parse(body);

    // For guest checkout, use teamId from request body instead of getTeamForUser()
    const teamId = validatedData.teamId;
    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    // Extract subdomain from request headers
    const host = request.headers.get("host") || "";
    const hostname = host.split(":")[0]; // Remove port if present
    const parts = hostname.split(".");

    let subdomain = "";
    // For development with custom hosts (e.g., shop1.localhost)
    if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
      subdomain = parts[0] === "localhost" ? "" : parts[0];
    }
    // For 1minute.shop domain (e.g., shop1.1minute.shop)
    else if (
      parts.length >= 3 &&
      parts[parts.length - 2] === "1minute" &&
      parts[parts.length - 1] === "shop"
    ) {
      subdomain = parts[0] === "www" ? "" : parts[0];
    }
    // For production domains (e.g., shop1.example.com)
    else if (parts.length >= 3) {
      subdomain = parts[0];
    }

    // Build the success URL with subdomain preserved
    const baseURL = process.env.BASE_URL || `http://${host}`;
    const successURL = subdomain
      ? `${baseURL.replace(
          "://",
          `://${subdomain}.`
        )}/shop?success=true&session_id={CHECKOUT_SESSION_ID}`
      : `${baseURL}/shop?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelURL = subdomain
      ? `${baseURL.replace("://", `://${subdomain}.`)}/shop?canceled=true`
      : `${baseURL}/shop?canceled=true`;

    // Create line items for Stripe
    const lineItems = validatedData.items.map((item) => ({
      price_data: {
        currency: item.currency.toLowerCase(),
        product_data: {
          name: item.name,
          description: item.description || "",
        },
        unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successURL,
      cancel_url: cancelURL,
      customer_email: validatedData.customerEmail,
      allow_promotion_codes: true, // Enable promo codes
      metadata: {
        teamId: teamId.toString(),
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        contactNumber: validatedData.contactNumber,
        deliveryAddress: validatedData.deliveryAddress,
        items: JSON.stringify(
          validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            currency: item.currency,
          }))
        ),
        totalAmount: validatedData.totalAmount,
        currency: validatedData.currency,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);

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
