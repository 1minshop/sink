import { db } from "@/lib/db/drizzle";
import {
  orders,
  orderItems,
  NewOrder,
  NewOrderItem,
  teamMembers,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface CreateOrderData {
  teamId: number;
  customerName: string;
  customerEmail: string;
  contactNumber: string;
  deliveryAddress: string;
  items: Array<{
    productId: number;
    quantity: number;
    price: string;
    currency: string;
  }>;
  totalAmount: string;
  currency: string;
  status?: "pending" | "paid" | "completed" | "cancelled";
  paymentMethod?: "stripe" | "qr_code";
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  proofOfPaymentImageUrl?: string;
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
        contactNumber: data.contactNumber,
        deliveryAddress: data.deliveryAddress,
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: data.status || "pending",
        paymentMethod: data.paymentMethod || "qr_code",
        stripePaymentIntentId: data.stripePaymentIntentId,
        stripeSessionId: data.stripeSessionId,
        proofOfPaymentImageUrl: data.proofOfPaymentImageUrl,
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

export async function updateOrderWithProofOfPayment(
  orderId: number,
  proofOfPaymentImageUrl: string
) {
  const [updatedOrder] = await db
    .update(orders)
    .set({
      proofOfPaymentImageUrl,
      status: "paid", // Update status to paid when proof is submitted
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  // Send email notifications
  if (updatedOrder) {
    try {
      // Import email service dynamically to avoid circular dependencies
      const { sendOrderConfirmationEmail, sendOrderNotificationToStore } =
        await import("@/lib/email/service");

      // Get full order details with items and team
      const fullOrder = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: {
          orderItems: {
            with: {
              product: true,
            },
          },
          team: true,
        },
      });

      if (fullOrder) {
        // Transform database order to email data format
        const emailData = {
          orderId: fullOrder.id,
          customerName: fullOrder.customerName,
          customerEmail: fullOrder.customerEmail,
          contactNumber: fullOrder.contactNumber || "",
          deliveryAddress: fullOrder.deliveryAddress || "",
          totalAmount: fullOrder.totalAmount,
          currency: fullOrder.currency,
          paymentMethod: fullOrder.paymentMethod,
          items: fullOrder.orderItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            currency: item.currency,
          })),
          teamName: fullOrder.team.name,
          orderDate: fullOrder.createdAt.toISOString(),
        };

        // Send confirmation email to customer
        await sendOrderConfirmationEmail(emailData);

        // Get store owner email and send notification
        const storeOwnerEmail = await getStoreOwnerEmail(fullOrder.teamId);
        if (storeOwnerEmail) {
          await sendOrderNotificationToStore(emailData, storeOwnerEmail);
        }
      }
    } catch (error) {
      console.error(
        "Error sending email notifications for QR code payment:",
        error
      );
      // Don't throw error - order update was successful, email failure shouldn't break the flow
    }
  }

  return updatedOrder;
}

export async function getStoreOwnerEmail(
  teamId: number
): Promise<string | null> {
  try {
    const ownerResult = await db
      .select({
        email: users.email,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, "owner")))
      .limit(1);

    return ownerResult.length > 0 ? ownerResult[0].email : null;
  } catch (error) {
    console.error("Error fetching store owner email:", error);
    return null;
  }
}
