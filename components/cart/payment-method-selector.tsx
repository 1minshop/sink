"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { CreditCard, QrCode } from "lucide-react";

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
      <div className="pt-6">
        <p className="text-center text-muted-foreground">
          No payment methods are currently available. Please contact the store
          owner.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Payment Method
      </h3>
      <div className="space-y-3">
        {enableStripe && (
          <div
            onClick={() => onMethodChange("stripe")}
            className={`flex items-start space-x-4 rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/50 ${
              selectedMethod === "stripe"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-start space-x-3 flex-1">
              <div className="p-2 rounded-lg bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-gray-900">
                  Credit Card (Stripe)
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Pay securely with your credit or debit card. Supports all
                  major cards.
                </p>
              </div>
            </div>
          </div>
        )}

        {enableQrCode && (
          <div
            onClick={() => onMethodChange("qr_code")}
            className={`flex items-start space-x-4 rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/50 ${
              selectedMethod === "qr_code"
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-start space-x-3 flex-1">
              <div className="p-2 rounded-lg bg-green-100">
                <QrCode className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-gray-900">
                  QR Code Payment
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Pay using mobile banking, mBoB, or e-wallet apps by scanning
                  QR code.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
