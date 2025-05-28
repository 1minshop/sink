import { db } from "@/lib/db/drizzle";
import { orders, orderItems, NewOrder, NewOrderItem } from "@/lib/db/schema";

interface CreateOrderData {
  teamId: number;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: number;
    quantity: number;
    price: string;
    currency: string;
  }>;
  totalAmount: string;
  currency: string;
}

export async function createOrder(data: CreateOrderData) {
  return await db.transaction(async (tx) => {
    // Create the order
    const [order] = await tx
      .insert(orders)
      .values({
        teamId: data.teamId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: "pending",
      })
      .returning();

    // Create order items
    const orderItemsData: NewOrderItem[] = data.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      currency: item.currency,
    }));

    await tx.insert(orderItems).values(orderItemsData);

    return order;
  });
}

export async function getTeamOrders(teamId: number) {
  return await db.query.orders.findMany({
    where: (orders, { eq }) => eq(orders.teamId, teamId),
    with: {
      orderItems: {
        with: {
          product: true,
        },
      },
    },
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
  });
}
