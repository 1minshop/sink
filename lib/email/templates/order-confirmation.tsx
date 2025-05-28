import * as React from "react";

export interface OrderConfirmationEmailProps {
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

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderId,
  customerName,
  customerEmail,
  contactNumber,
  deliveryAddress,
  totalAmount,
  currency,
  paymentMethod,
  items,
  teamName,
  orderDate,
}) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
    }}
  >
    <div
      style={{
        textAlign: "center",
        padding: "20px 0",
        borderBottom: "2px solid #f97316",
      }}
    >
      <h1 style={{ color: "#f97316", margin: "0" }}>Order Confirmation</h1>
      <p style={{ color: "#6b7280", margin: "10px 0 0 0" }}>
        Thank you for your order!
      </p>
    </div>

    <div style={{ padding: "30px 20px" }}>
      <p style={{ fontSize: "16px", marginBottom: "20px" }}>
        Hi {customerName},
      </p>

      <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "30px" }}>
        We've received your order and it's being processed. Here are the
        details:
      </p>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h2
          style={{ color: "#374151", margin: "0 0 15px 0", fontSize: "18px" }}
        >
          Order Summary
        </h2>
        <div
          style={{
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>Order ID:</strong> #{orderId}
        </div>
        <div
          style={{
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>Store:</strong> {teamName}
        </div>
        <div
          style={{
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>Order Date:</strong> {orderDate}
        </div>
        <div
          style={{
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>Payment Method:</strong>{" "}
          {paymentMethod === "stripe" ? "Credit Card" : "QR Code Payment"}
        </div>
        <div style={{ fontWeight: "bold", fontSize: "18px", color: "#f97316" }}>
          <strong>Total:</strong> {currency === "INR" ? "₹" : "$"}
          {totalAmount} {currency}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <h3
          style={{ color: "#374151", margin: "0 0 20px 0", fontSize: "16px" }}
        >
          Customer Information
        </h3>
        <div
          style={{
            borderBottom: "1px solid #f3f4f6",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>Name:</strong> {customerName}
        </div>
        <div
          style={{
            borderBottom: "1px solid #f3f4f6",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>Email:</strong> {customerEmail}
        </div>
        <div
          style={{
            borderBottom: "1px solid #f3f4f6",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>Contact Number:</strong> {contactNumber}
        </div>
        <div>
          <strong>Delivery Address:</strong> {deliveryAddress}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <h3
          style={{ color: "#374151", margin: "0 0 20px 0", fontSize: "16px" }}
        >
          Items Ordered
        </h3>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              borderBottom:
                index < items.length - 1 ? "1px solid #f3f4f6" : "none",
              paddingBottom: "15px",
              marginBottom: "15px",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
              {item.name}
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>
              Quantity: {item.quantity} × {item.currency === "INR" ? "₹" : "$"}
              {item.price} = {item.currency === "INR" ? "₹" : "$"}
              {(parseFloat(item.price) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {paymentMethod === "qr_code" && (
        <div
          style={{
            backgroundColor: "#fef3cd",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "30px",
          }}
        >
          <p style={{ margin: "0", color: "#92400e", fontSize: "14px" }}>
            <strong>QR Code Payment:</strong> Your order is being processed. If
            you haven't completed the payment yet, please ensure you transfer
            the exact amount and submit your proof of payment.
          </p>
        </div>
      )}

      <div
        style={{
          backgroundColor: "#f0f9ff",
          border: "1px solid #0ea5e9",
          borderRadius: "8px",
          padding: "15px",
          marginBottom: "30px",
        }}
      >
        <p style={{ margin: "0", color: "#0c4a6e", fontSize: "14px" }}>
          <strong>What's Next?</strong> We'll send you another email with
          tracking information once your order ships. If you have any questions,
          please don't hesitate to contact the store.
        </p>
      </div>

      <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.6" }}>
        Thank you for shopping with {teamName}!
      </p>
    </div>

    <div
      style={{
        borderTop: "1px solid #e5e7eb",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f9fafb",
      }}
    >
      <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
        This email was sent by 1 Minute Shop. If you have any questions, please
        contact the store directly.
      </p>
    </div>
  </div>
);

export default OrderConfirmationEmail;
