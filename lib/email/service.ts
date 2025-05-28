import { Resend } from "resend";
import { OrderConfirmationEmail } from "./templates/order-confirmation";
import { createElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  contactNumber: string;
  deliveryAddress: string;
  totalAmount: string;
  currency: string;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
    currency: string;
  }>;
  teamName: string;
  orderDate: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "orders@1minute.shop",
      to: [data.customerEmail],
      subject: `Order Confirmation #${data.orderId} - ${data.teamName}`,
      react: createElement(OrderConfirmationEmail, data),
    });

    if (error) {
      console.error("Failed to send order confirmation email:", error);
      throw error;
    }

    console.log("Order confirmation email sent successfully:", emailResult?.id);
    return emailResult;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
}

export async function sendOrderNotificationToStore(
  data: OrderEmailData,
  storeOwnerEmail: string
) {
  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "orders@1minute.shop",
      to: [storeOwnerEmail],
      subject: `New Order #${data.orderId} - ${data.teamName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">New Order Received!</h2>
          <p>You have received a new order on your 1 Minute Shop store.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${data.orderId}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Contact Number:</strong> ${data.contactNumber}</p>
            <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
            <p><strong>Total:</strong> ${data.currency === "INR" ? "₹" : "$"}${data.totalAmount} ${data.currency}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod === "stripe" ? "Credit Card" : "QR Code Payment"}</p>
            <p><strong>Order Date:</strong> ${data.orderDate}</p>
          </div>

          <div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3>Customer Information</h3>
            <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0;">
              <p><strong>Name:</strong> ${data.customerName}</p>
            </div>
            <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0;">
              <p><strong>Email:</strong> ${data.customerEmail}</p>
            </div>
            <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0;">
              <p><strong>Contact Number:</strong> ${data.contactNumber}</p>
            </div>
            <div style="padding: 10px 0;">
              <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
            </div>
          </div>

          <div style="background-color: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3>Items Ordered</h3>
            ${data.items
              .map(
                (item) => `
              <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0;">
                <p><strong>${item.name}</strong></p>
                <p>Quantity: ${item.quantity} × ${item.currency === "INR" ? "₹" : "$"}${item.price} = ${item.currency === "INR" ? "₹" : "$"}${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
              </div>
            `
              )
              .join("")}
          </div>

          <p style="color: #6b7280;">
            You can manage this order from your dashboard at <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" style="color: #f97316;">your orders page</a>.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Failed to send order notification to store:", error);
      throw error;
    }

    console.log(
      "Order notification sent to store successfully:",
      emailResult?.id
    );
    return emailResult;
  } catch (error) {
    console.error("Error sending order notification to store:", error);
    throw error;
  }
}
