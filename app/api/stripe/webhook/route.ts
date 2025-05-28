import Stripe from "stripe";
import { handleSubscriptionChange, stripe } from "@/lib/payments/stripe";
import { createOrder } from "@/lib/db/order-actions";
import { NextRequest, NextResponse } from "next/server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    console.log(`Received Stripe webhook event: ${event.type}`);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;

    case "checkout.session.completed":
      const session = event.data.object;
      console.log(
        "Processing checkout.session.completed webhook for session:",
        session.id
      );

      // Handle product purchases (not subscriptions)
      if (
        "mode" in session &&
        session.mode === "payment" &&
        "metadata" in session &&
        session.metadata
      ) {
        try {
          const metadata = session.metadata;
          console.log("Session metadata:", metadata);

          const items = JSON.parse(metadata.items || "[]");
          console.log("Parsed items:", items);

          // Determine order status based on payment status
          const paymentStatus =
            "payment_status" in session ? session.payment_status : "unpaid";
          const orderStatus: "paid" | "pending" =
            paymentStatus === "paid" ? "paid" : "pending";

          console.log(
            "Payment status:",
            paymentStatus,
            "Order status:",
            orderStatus
          );

          const orderData = {
            teamId: parseInt(metadata.teamId),
            customerName: metadata.customerName,
            customerEmail: metadata.customerEmail,
            items: items,
            totalAmount: metadata.totalAmount,
            currency: metadata.currency,
            status: orderStatus,
            paymentMethod: "stripe" as const,
            stripeSessionId: session.id as string,
            stripePaymentIntentId: ("payment_intent" in session
              ? session.payment_intent
              : null) as string,
          };

          console.log("Creating order with data:", orderData);

          const order = await createOrder(orderData);

          console.log(
            "Order created successfully:",
            "ID:",
            order.id,
            "Session:",
            session.id,
            "Status:",
            orderStatus
          );
        } catch (error) {
          console.error("Error creating order from Stripe webhook:", error);
          console.error("Session data:", JSON.stringify(session, null, 2));
        }
      } else {
        console.log(
          "Skipping session - not a payment mode or missing metadata:",
          {
            mode: "mode" in session ? session.mode : "unknown",
            hasMetadata: "metadata" in session && !!session.metadata,
          }
        );
      }
      break;

    case "checkout.session.async_payment_succeeded":
      const successSession = event.data.object;
      console.log(
        "Processing checkout.session.async_payment_succeeded webhook for session:",
        successSession.id
      );

      // Update order status to paid for async payments
      if (
        "mode" in successSession &&
        successSession.mode === "payment" &&
        "metadata" in successSession &&
        successSession.metadata
      ) {
        try {
          // Find the order by stripeSessionId and update it to paid
          // This would require an updateOrder function, but for now we'll log it
          console.log(
            "Async payment succeeded for session:",
            successSession.id
          );
          console.log("Order should be marked as paid");
          // TODO: Implement updateOrderStatus function if needed
        } catch (error) {
          console.error("Error handling async payment success:", error);
        }
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  console.log(`Webhook processing completed for event: ${event.type}`);
  return NextResponse.json({ received: true });
}
