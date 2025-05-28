"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, QrCode, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectorProps {
  selectedMethod: "stripe" | "qr_code";
  onMethodChange: (method: "stripe" | "qr_code") => void;
  enableStripe: boolean;
  enableQrCode: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  enableStripe,
  enableQrCode,
}: PaymentMethodSelectorProps) {
  if (!enableStripe && !enableQrCode) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No payment methods are currently available. Please contact the store
            owner.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {enableStripe && (
            <div
              onClick={() => onMethodChange("stripe")}
              className={cn(
                "relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedMethod === "stripe"
                  ? "border-orange-500 bg-orange-500/5 shadow-sm"
                  : "border-border hover:border-orange-500/50"
              )}
            >
              {selectedMethod === "stripe" && (
                <div className="absolute top-3 right-3">
                  <div className="rounded-full bg-orange-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "rounded-lg p-2 transition-colors",
                    selectedMethod === "stripe"
                      ? "bg-orange-500/10 text-orange-500"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Credit Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay securely with your credit or debit card
                  </p>
                </div>
              </div>
            </div>
          )}

          {enableQrCode && (
            <div
              onClick={() => onMethodChange("qr_code")}
              className={cn(
                "relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedMethod === "qr_code"
                  ? "border-orange-500 bg-orange-500/5 shadow-sm"
                  : "border-border hover:border-orange-500/50"
              )}
            >
              {selectedMethod === "qr_code" && (
                <div className="absolute top-3 right-3">
                  <div className="rounded-full bg-orange-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "rounded-lg p-2 transition-colors",
                    selectedMethod === "qr_code"
                      ? "bg-orange-500/10 text-orange-500"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <QrCode className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">QR Code Payment</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay using mobile banking or e-wallet
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
