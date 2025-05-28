"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCart, useCartActions } from "@/lib/cart/cart-context";
import { ArrowLeft, CreditCard } from "lucide-react";

interface CheckoutFormProps {
  onBack: () => void;
  onSuccess: () => void;
  teamId: number;
}

export function CheckoutForm({ onBack, onSuccess, teamId }: CheckoutFormProps) {
  const { state } = useCart();
  const { clearCart } = useCartActions();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        teamId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        items: state.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          currency: item.product.currency,
        })),
        totalAmount: state.total.toFixed(2),
        currency: state.items[0]?.product.currency || "USD",
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

      // Clear cart and show success
      clearCart();
      toast.success("Order placed successfully!", {
        duration: 1000,
      });

      onSuccess();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to place order",
        {
          duration: 1000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.customerName.trim() && formData.customerEmail.trim();

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
          </div>

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
          disabled={!isFormValid || loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Place Order</span>
            </div>
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-3">
          Your order will be processed and you'll receive a confirmation email.
        </p>
      </div>
    </div>
  );
}
