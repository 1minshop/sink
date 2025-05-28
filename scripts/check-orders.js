#!/usr/bin/env node

// Script to check recent orders and their status
const { db } = require("../lib/db/drizzle.ts");
const { orders, orderItems } = require("../lib/db/schema.ts");
const { desc, eq } = require("drizzle-orm");

async function checkRecentOrders() {
  try {
    console.log("Checking recent orders...");

    // Get the most recent 10 orders
    const recentOrders = await db.query.orders.findMany({
      with: {
        orderItems: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
      limit: 10,
    });

    console.log(`Found ${recentOrders.length} recent orders:`);
    console.log("");

    recentOrders.forEach((order, index) => {
      console.log(`Order #${index + 1}:`);
      console.log(`  ID: ${order.id}`);
      console.log(`  Team ID: ${order.teamId}`);
      console.log(`  Customer: ${order.customerName} (${order.customerEmail})`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Payment Method: ${order.paymentMethod}`);
      console.log(`  Total: ${order.totalAmount} ${order.currency}`);
      console.log(`  Stripe Session: ${order.stripeSessionId || "N/A"}`);
      console.log(`  Created: ${order.createdAt}`);
      console.log(`  Items: ${order.orderItems.length} item(s)`);

      order.orderItems.forEach((item, itemIndex) => {
        console.log(
          `    Item ${itemIndex + 1}: ${item.product?.name || "Unknown"} x${
            item.quantity
          } @ ${item.price} ${item.currency}`
        );
      });

      console.log("");
    });

    // Check for Stripe orders specifically
    const stripeOrders = recentOrders.filter(
      (order) => order.paymentMethod === "stripe"
    );
    console.log(`Stripe orders: ${stripeOrders.length}`);

    const paidOrders = recentOrders.filter((order) => order.status === "paid");
    console.log(`Paid orders: ${paidOrders.length}`);

    const pendingOrders = recentOrders.filter(
      (order) => order.status === "pending"
    );
    console.log(`Pending orders: ${pendingOrders.length}`);
  } catch (error) {
    console.error("Error checking orders:", error);
    process.exit(1);
  }
}

// Run the check
checkRecentOrders()
  .then(() => {
    console.log("Order check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Order check failed:", error);
    process.exit(1);
  });
