"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCart, useCartActions } from "@/lib/cart/cart-context";
import { ArrowLeft, CreditCard, QrCode } from "lucide-react";
import { PaymentMethodSelector } from "./payment-method-selector";
import { QRCodePayment } from "./qr-code-payment";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  onBack: () => void;
  onSuccess: () => void;
  teamId: number;
}

interface TeamPaymentSettings {
  enableStripePayment: boolean;
  enableQrPayment: boolean;
  qrCodeImageUrl?: string;
  qrCodePaymentName?: string;
  qrCodePaymentDetails?: string;
}

export function CheckoutForm({ onBack, onSuccess, teamId }: CheckoutFormProps) {
  const { state } = useCart();
  const { clearCart } = useCartActions();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] =
    useState<TeamPaymentSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "qr_code">(
    "qr_code"
  );
  const [currentStep, setCurrentStep] = useState<"details" | "payment">(
    "details"
  );
  const [orderId, setOrderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    deliveryAddress: "",
    contactNumber: "",
  });

  // Fetch payment settings on component mount
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await fetch(`/api/payment-settings?teamId=${teamId}`);
        if (response.ok) {
          const settings = await response.json();
          setPaymentSettings(settings);

          // Set default payment method based on available options
          if (settings.enableQrPayment) {
            setPaymentMethod("qr_code");
          } else if (settings.enableStripePayment) {
            setPaymentMethod("stripe");
          }
        } else {
          throw new Error("Failed to fetch payment settings");
        }
      } catch (error) {
        console.error("Error fetching payment settings:", error);
        toast.error("Failed to load payment methods");
      }
    };

    fetchPaymentSettings();
  }, [teamId]);

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      const orderData = {
        teamId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        deliveryAddress: formData.deliveryAddress,
        contactNumber: formData.contactNumber,
        items: state.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          currency: item.product.currency,
          name: item.product.name,
          description: item.product.description || "",
        })),
        totalAmount: state.total.toFixed(2),
        currency: state.items[0]?.product.currency || "USD",
      };

      const response = await fetch("/api/stripe/product-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      window.location.href = result.url;
    } catch (error) {
      console.error("Stripe checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initialize payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQRCodeOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        teamId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        deliveryAddress: formData.deliveryAddress,
        contactNumber: formData.contactNumber,
        items: state.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          currency: item.product.currency,
        })),
        totalAmount: state.total.toFixed(2),
        currency: state.items[0]?.product.currency || "USD",
        paymentMethod: "qr_code",
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create order");
      }

      setOrderId(result.orderId);
      setCurrentStep("payment");
    } catch (error) {
      console.error("QR Code order error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "stripe") {
      await handleStripeCheckout();
    } else {
      await handleQRCodeOrder();
    }
  };

  const handlePaymentConfirm = () => {
    // For QR payments, redirect to the QR confirmation page instead of just calling onSuccess
    if (paymentMethod === "qr_code" && orderId) {
      clearCart();
      toast.success("Order completed successfully!", {
        duration: 2000,
      });

      // Build the confirmation URL with QR success parameters
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("qr_success", "true");
      currentUrl.searchParams.set("order_id", orderId.toString());

      // Clear any existing success parameters to avoid conflicts
      currentUrl.searchParams.delete("success");
      currentUrl.searchParams.delete("session_id");

      // Use Next.js router to navigate to the confirmation page
      setTimeout(() => {
        router.push(currentUrl.toString());
      }, 1000);
    } else {
      // For other payment methods, use the default behavior
      clearCart();
      toast.success("Order completed successfully!", {
        duration: 2000,
      });
      onSuccess();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.customerName.trim() &&
    formData.customerEmail.trim() &&
    formData.deliveryAddress.trim() &&
    formData.contactNumber.trim();

  // Show QR code payment screen
  if (
    currentStep === "payment" &&
    paymentMethod === "qr_code" &&
    orderId &&
    paymentSettings
  ) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep("details")}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">Payment</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <QRCodePayment
            qrCodeImageUrl={paymentSettings.qrCodeImageUrl}
            paymentName={paymentSettings.qrCodePaymentName}
            paymentDetails={paymentSettings.qrCodePaymentDetails}
            totalAmount={state.total.toFixed(2)}
            currency={state.items[0]?.product.currency || "USD"}
            orderId={orderId}
            onPaymentConfirm={handlePaymentConfirm}
          />
        </div>
      </div>
    );
  }

  if (!paymentSettings) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-2 text-muted-foreground">Loading payment options...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">Checkout</h2>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>

            <div>
              <Label
                htmlFor="customerName"
                className="text-sm font-medium text-gray-700"
              >
                Full Name *
              </Label>
              <Input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  handleInputChange("customerName", e.target.value)
                }
                placeholder="Enter your full name"
                required
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <Label
                htmlFor="customerEmail"
                className="text-sm font-medium text-gray-700"
              >
                Email Address *
              </Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  handleInputChange("customerEmail", e.target.value)
                }
                placeholder="Enter your email address"
                required
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <Label
                htmlFor="contactNumber"
                className="text-sm font-medium text-gray-700"
              >
                Contact Number *
              </Label>
              <Input
                id="contactNumber"
                type="tel"
                value={formData.contactNumber}
                onChange={(e) =>
                  handleInputChange("contactNumber", e.target.value)
                }
                placeholder="Enter your contact number"
                required
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <Label
                htmlFor="deliveryAddress"
                className="text-sm font-medium text-gray-700"
              >
                Delivery Address *
              </Label>
              <Input
                id="deliveryAddress"
                type="text"
                value={formData.deliveryAddress}
                onChange={(e) =>
                  handleInputChange("deliveryAddress", e.target.value)
                }
                placeholder="Enter your delivery address"
                required
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
            enableStripe={paymentSettings.enableStripePayment}
            enableQrCode={paymentSettings.enableQrPayment}
          />

          {/* Order Summary */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h3>

            <div className="space-y-3">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {item.product.currency === "BTN" ? "Nu. " : "$ "}
                    {(parseFloat(item.product.price) * item.quantity).toFixed(
                      2
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-orange-600">
                  {state.items[0]?.product.currency === "BTN" ? "Nu. " : "$ "}
                  {state.total.toFixed(2)}{" "}
                  {state.items[0]?.product.currency || "USD"}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={
            !isFormValid ||
            loading ||
            (!paymentSettings.enableStripePayment &&
              !paymentSettings.enableQrPayment)
          }
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {paymentMethod === "stripe" ? (
                <CreditCard className="h-4 w-4" />
              ) : (
                <QrCode className="h-4 w-4" />
              )}
              <span>
                {paymentMethod === "stripe"
                  ? "Pay with Card"
                  : "Pay by QR Code"}
              </span>
            </div>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-3">
          {paymentMethod === "stripe"
            ? "You'll be redirected to Stripe to complete your payment securely. Promo codes can be applied during checkout."
            : "You'll be shown payment instructions after placing your order."}
        </p>
      </div>
    </div>
  );
}
