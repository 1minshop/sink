import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { orders, orderItems, products, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Fetch order with team information
    const orderWithTeam = await db
      .select({
        order: orders,
        teamName: teams.name,
      })
      .from(orders)
      .innerJoin(teams, eq(orders.teamId, teams.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderWithTeam.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { order, teamName } = orderWithTeam[0];

    // Fetch order items with product information
    const orderItemsWithProducts = await db
      .select({
        orderItem: orderItems,
        productName: products.name,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    // Format the response
    const orderData = {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      contactNumber: order.contactNumber,
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      teamName,
      items: orderItemsWithProducts.map((item) => ({
        name: item.productName,
        quantity: item.orderItem.quantity,
        price: item.orderItem.price,
        currency: item.orderItem.currency,
      })),
    };

    return NextResponse.json(orderData);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
