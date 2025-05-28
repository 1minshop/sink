#!/usr/bin/env node

/**
 * Test Email Notifications
 *
 * This script tests the email notification system for order confirmations.
 *
 * Prerequisites:
 * 1. Set RESEND_API_KEY in your .env file
 * 2. Set RESEND_FROM_EMAIL in your .env file
 *
 * Usage:
 *   npx tsx scripts/test-email-notifications.js
 */

import dotenv from "dotenv";
import {
  sendOrderConfirmationEmail,
  sendOrderNotificationToStore,
} from "../lib/email/service.js";

dotenv.config();

async function testEmailNotifications() {
  console.log("🧪 Testing Email Notifications...\n");

  // Check environment variables
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY not found in environment variables");
    console.log("Please add RESEND_API_KEY to your .env file");
    process.exit(1);
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    console.error("❌ RESEND_FROM_EMAIL not found in environment variables");
    console.log("Please add RESEND_FROM_EMAIL to your .env file");
    process.exit(1);
  }

  console.log("✅ Environment variables found");
  console.log(`From Email: ${process.env.RESEND_FROM_EMAIL}`);
  console.log("");

  // Test data
  const testOrderData = {
    orderId: 12345,
    customerName: "John Doe",
    customerEmail: "douglasswm94@gmail.com", // Change this to your email for testing
    totalAmount: "49.99",
    currency: "USD",
    paymentMethod: "stripe",
    items: [
      {
        name: "Test Product 1",
        quantity: 2,
        price: "19.99",
        currency: "USD",
      },
      {
        name: "Test Product 2",
        quantity: 1,
        price: "10.01",
        currency: "USD",
      },
    ],
    teamName: "Test Store",
    orderDate: new Date().toISOString(),
  };

  console.log("📧 Test Data:");
  console.log(JSON.stringify(testOrderData, null, 2));
  console.log("");

  try {
    console.log("📤 Sending order confirmation email...");
    await sendOrderConfirmationEmail(testOrderData);
    console.log("✅ Order confirmation email sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error.message);
  }

  try {
    console.log("📤 Sending store owner notification email...");
    await sendOrderNotificationToStore(testOrderData, "orders@1minute.shop"); // Change this to your email
    console.log("✅ Store owner notification email sent successfully!");
  } catch (error) {
    console.error(
      "❌ Failed to send store owner notification email:",
      error.message
    );
  }

  console.log("\n🎯 Test completed!");
  console.log("Check your email inbox for the test emails.");
}

testEmailNotifications().catch(console.error);
