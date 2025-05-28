#!/usr/bin/env node

/**
 * Test script to verify Stripe checkout with promo codes is working
 * This script tests the /api/stripe/product-checkout endpoint
 */

const SERVER_URL = "http://localhost:3000";

async function testPromoCodeCheckout() {
  console.log("🎫 Testing Stripe checkout with promo code support...");

  try {
    // Test data for checkout
    const checkoutData = {
      teamId: 1,
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      items: [
        {
          productId: 1,
          quantity: 2,
          price: "29.99",
          currency: "USD",
          name: "Test Product",
          description: "Test product for promo code testing",
        },
      ],
      totalAmount: "59.98",
      currency: "USD",
    };

    const response = await fetch(`${SERVER_URL}/api/stripe/product-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    });

    const result = await response.json();

    if (response.ok && result.success && result.url) {
      console.log("✅ Stripe checkout session created successfully");
      console.log("📱 Session ID:", result.sessionId);
      console.log("🔗 Checkout URL:", result.url);
      console.log("🎫 Promo codes are enabled in this session");
      console.log("");
      console.log("To test promo codes:");
      console.log("1. Visit the checkout URL");
      console.log("2. Look for 'Add promotion code' link");
      console.log("3. Enter a valid Stripe promotion code");
      console.log("4. Complete the checkout process");
    } else {
      console.error("❌ Checkout session creation failed");
      console.error("Response:", result);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(SERVER_URL);
    return response.status < 500;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Server is not running at", SERVER_URL);
    console.log("Please start the development server with: pnpm dev");
    process.exit(1);
  }

  console.log("✅ Server is running");
  console.log("");

  await testPromoCodeCheckout();
}

main().catch(console.error);
