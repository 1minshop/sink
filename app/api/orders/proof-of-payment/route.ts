import { NextRequest, NextResponse } from "next/server";
import { updateOrderWithProofOfPayment } from "@/lib/db/order-actions";

export async function POST(request: NextRequest) {
  try {
    const { orderId, proofOfPaymentImageUrl } = await request.json();

    if (!orderId || !proofOfPaymentImageUrl) {
      return NextResponse.json(
        { error: "Order ID and proof of payment image URL are required" },
        { status: 400 }
      );
    }

    // Update the order with proof of payment
    const updatedOrder = await updateOrderWithProofOfPayment(
      orderId,
      proofOfPaymentImageUrl
    );

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order with proof of payment:", error);
    return NextResponse.json(
      { error: "Failed to update order with proof of payment" },
      { status: 500 }
    );
  }
}
