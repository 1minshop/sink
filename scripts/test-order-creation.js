#!/usr/bin/env node

// Test script to verify order creation works properly
const { createOrder } = require("../lib/db/order-actions.ts");

async function testOrderCreation() {
  console.log("Testing order creation...");

  try {
    const testOrderData = {
      teamId: 1,
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      items: [
        {
          productId: 1,
          quantity: 2,
          price: "25.00",
          currency: "USD",
        },
      ],
      totalAmount: "50.00",
      currency: "USD",
      status: "paid",
      paymentMethod: "stripe",
      stripeSessionId: "cs_test_" + Date.now(),
      stripePaymentIntentId: "pi_test_" + Date.now(),
    };

    console.log(
      "Creating order with data:",
      JSON.stringify(testOrderData, null, 2)
    );

    const order = await createOrder(testOrderData);

    console.log("Order created successfully:", order);
    console.log("Order ID:", order.id);
    console.log("Order Status:", order.status);
  } catch (error) {
    console.error("Error creating test order:", error);
    process.exit(1);
  }
}

// Run the test
testOrderCreation()
  .then(() => {
    console.log("Test completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
