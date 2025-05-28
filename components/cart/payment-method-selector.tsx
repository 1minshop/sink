"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) =>
            onMethodChange(value as "stripe" | "qr_code")
          }
          className="space-y-4"
        >
          {enableStripe && (
            <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50">
              <RadioGroupItem value="stripe" id="stripe" />
              <div className="flex items-center space-x-2 flex-1">
                <CreditCard className="h-5 w-5" />
                <div>
                  <Label
                    htmlFor="stripe"
                    className="font-medium cursor-pointer"
                  >
                    Credit Card (Stripe)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pay securely with your credit or debit card
                  </p>
                </div>
              </div>
            </div>
          )}

          {enableQrCode && (
            <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50">
              <RadioGroupItem value="qr_code" id="qr_code" />
              <div className="flex items-center space-x-2 flex-1">
                <QrCode className="h-5 w-5" />
                <div>
                  <Label
                    htmlFor="qr_code"
                    className="font-medium cursor-pointer"
                  >
                    QR Code Payment
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pay using mobile banking or e-wallet
                  </p>
                </div>
              </div>
            </div>
          )}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
