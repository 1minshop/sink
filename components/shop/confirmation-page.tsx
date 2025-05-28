"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Package,
  ArrowRight,
  CreditCard,
  Calendar,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useCartActions } from "@/lib/cart/cart-context";

interface StripeSessionData {
  id: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  payment_status: string;
  status: string;
  created: number;
  metadata: {
    customerName?: string;
    teamId?: string;
  };
  line_items: Array<{
    quantity: number;
    amount_total: number;
    description: string;
    price: {
      unit_amount: number;
      currency: string;
      product: {
        name: string;
        description?: string;
      };
    };
  }>;
}

interface ConfirmationPageProps {
  sessionId: string;
  onContinueShopping: () => void;
}

export function ConfirmationPage({
  sessionId,
  onContinueShopping,
}: ConfirmationPageProps) {
  const [sessionData, setSessionData] = useState<StripeSessionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);
  const { clearCart } = useCartActions();

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(
          `/api/stripe/session?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch session details");
        }

        const data = await response.json();
        setSessionData(data);

        // Clear cart if payment was successful and we haven't cleared it yet
        if (
          data.payment_status === "paid" &&
          data.status === "complete" &&
          !cartCleared
        ) {
          clearCart();
          setCartCleared(true);
        }
      } catch (err) {
        console.error("Error fetching session data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId, clearCart, cartCleared]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (!sessionData) {
    return null;
  }

  const isPaymentSuccessful =
    sessionData.payment_status === "paid" && sessionData.status === "complete";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {isPaymentSuccessful ? "Payment Successful!" : "Order Received"}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Order Details */}
        <div className="xl:col-span-2 space-y-6">
          {/* Transaction Summary */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2 flex-shrink-0" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Transaction ID
                  </p>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {sessionData.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Payment Status
                  </p>
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                        isPaymentSuccessful ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isPaymentSuccessful
                          ? "text-green-700"
                          : "text-yellow-700"
                      }`}
                    >
                      {isPaymentSuccessful ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Total Amount
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      sessionData.amount_total,
                      sessionData.currency
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Purchase Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDate(sessionData.created)}
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
                {sessionData.line_items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 break-words">
                        {item.price.product.name}
                      </h4>
                      {item.price.product.description && (
                        <p className="text-sm text-gray-600 mt-1 break-words">
                          {item.price.product.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-1">
                        <span>Qty: {item.quantity}</span>
                        <span>•</span>
                        <span>
                          {formatCurrency(
                            item.price.unit_amount,
                            item.price.currency
                          )}{" "}
                          each
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.amount_total, item.price.currency)}
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
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionData.metadata.customerName && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                  <p className="text-sm text-gray-900 break-words">
                    {sessionData.metadata.customerName}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900 break-all">
                  {sessionData.customer_email}
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
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    The store owner will process your order
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
