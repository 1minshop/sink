#!/usr/bin/env node

// Test script to simulate a Stripe webhook call
const fetch = require("node-fetch");

async function testWebhook() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";

  // Mock Stripe checkout.session.completed event
  const mockEvent = {
    id: "evt_test_" + Date.now(),
    object: "event",
    api_version: "2020-08-27",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: "cs_test_" + Date.now(),
        object: "checkout.session",
        mode: "payment",
        payment_status: "paid",
        status: "complete",
        payment_intent: "pi_test_" + Date.now(),
        metadata: {
          teamId: "1",
          customerName: "Test Customer",
          customerEmail: "test@example.com",
          items: JSON.stringify([
            {
              productId: 1,
              quantity: 2,
              price: "25.00",
              currency: "USD",
            },
          ]),
          totalAmount: "50.00",
          currency: "USD",
        },
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: "req_test_" + Date.now(),
      idempotency_key: null,
    },
    type: "checkout.session.completed",
  };

  console.log("Testing webhook with mock event...");
  console.log("Event type:", mockEvent.type);
  console.log("Session ID:", mockEvent.data.object.id);
  console.log("Payment status:", mockEvent.data.object.payment_status);

  // Note: This won't work without proper Stripe signature, but it shows the structure
  console.log("Webhook endpoint:", `${baseUrl}/api/stripe/webhook`);
  console.log("Mock event created. To test properly, you would need:");
  console.log("1. A valid Stripe signature");
  console.log("2. The correct webhook secret");
  console.log(
    "3. Or use Stripe CLI for testing: stripe listen --forward-to localhost:3000/api/stripe/webhook"
  );

  console.log(
    "\nTo test manually, create a successful checkout and check the logs for:"
  );
  console.log('- "Processing checkout.session.completed webhook"');
  console.log('- "Order created successfully"');
  console.log('- Check the orders table for new records with status "paid"');
}

testWebhook().catch(console.error);
