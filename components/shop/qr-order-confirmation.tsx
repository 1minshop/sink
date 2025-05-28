"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Package,
  ArrowRight,
  QrCode,
  Calendar,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useCartActions } from "@/lib/cart/cart-context";

interface OrderData {
  id: number;
  customerName: string;
  customerEmail: string;
  contactNumber: string;
  deliveryAddress: string;
  totalAmount: string;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
    currency: string;
  }>;
  teamName: string;
}

interface QROrderConfirmationProps {
  orderId: string;
  onContinueShopping: () => void;
}

export function QROrderConfirmation({
  orderId,
  onContinueShopping,
}: QROrderConfirmationProps) {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);
  const { clearCart } = useCartActions();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrderData(data);

        // Clear cart after successful order confirmation and we haven't cleared it yet
        if (!cartCleared) {
          clearCart();
          setCartCleared(true);
        }
      } catch (err) {
        console.error("Error fetching order data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId, clearCart, cartCleared]);

  const formatCurrency = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    if (currency === "BTN") {
      return `Nu. ${numAmount.toFixed(2)}`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-700 bg-green-500";
      case "pending":
        return "text-yellow-700 bg-yellow-500";
      case "processing":
        return "text-blue-700 bg-blue-500";
      default:
        return "text-gray-700 bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Payment Confirmed";
      case "pending":
        return "Pending Payment";
      case "processing":
        return "Processing";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              Error Loading Order
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We couldn't load your order details. Please contact support if
              this problem persists.
            </p>
            <Button
              onClick={onContinueShopping}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  const isPending = orderData.status.toLowerCase() === "pending";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Thank you for your order. We've received your order details and{" "}
          {isPending
            ? "are waiting for payment confirmation"
            : "your payment has been confirmed"}
          .
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Order Details */}
        <div className="xl:col-span-2 space-y-6">
          {/* Order Summary */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <QrCode className="w-5 h-5 mr-2 flex-shrink-0" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Order ID
                  </p>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    #{orderData.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Order Status
                  </p>
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                        getStatusColor(orderData.status).split(" ")[1]
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        getStatusColor(orderData.status).split(" ")[0]
                      }`}
                    >
                      {getStatusText(orderData.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(orderData.totalAmount, orderData.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Order Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDate(orderData.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Package className="w-5 h-5 mr-2 flex-shrink-0" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {orderData.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 break-words">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-1">
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>
                          {formatCurrency(item.price, item.currency)} each
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(
                          (parseFloat(item.price) * item.quantity).toFixed(2),
                          item.currency
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Information and Next Steps */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                <p className="text-sm text-gray-900 break-words">
                  {orderData.customerName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900 break-all">
                  {orderData.customerEmail}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Contact Number
                </p>
                <p className="text-sm text-gray-900">
                  {orderData.contactNumber}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Delivery Address
                </p>
                <p className="text-sm text-gray-900 break-words">
                  {orderData.deliveryAddress}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    You'll receive an email confirmation shortly
                  </p>
                </div>
                {isPending && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      Complete your payment and upload proof of payment to
                      confirm your order
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    The store owner will process your order once payment is
                    confirmed
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Contact the store directly for delivery updates
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={onContinueShopping}
                  className="w-full bg-orange-500 hover:bg-orange-600 transition-colors"
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
