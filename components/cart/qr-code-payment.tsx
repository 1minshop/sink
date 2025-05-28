"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface QRCodePaymentProps {
  qrCodeImageUrl?: string;
  paymentName?: string;
  paymentDetails?: string;
  totalAmount: string;
  currency: string;
  orderId: number;
  onPaymentConfirm: () => void;
}

export function QRCodePayment({
  qrCodeImageUrl,
  paymentName,
  paymentDetails,
  totalAmount,
  currency,
  orderId,
  onPaymentConfirm,
}: QRCodePaymentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyDetails = () => {
    if (paymentDetails) {
      navigator.clipboard.writeText(paymentDetails);
      setCopied(true);
      toast.success("Payment details copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {totalAmount} {currency}
            </div>
            <div className="text-sm text-muted-foreground">
              Order #{orderId}
            </div>
          </div>

          {qrCodeImageUrl && (
            <div className="flex justify-center">
              <div className="relative w-64 h-64 border rounded-lg overflow-hidden">
                <Image
                  src={qrCodeImageUrl}
                  alt="QR Code for Payment"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {paymentName && (
            <div className="text-center">
              <div className="font-medium">{paymentName}</div>
            </div>
          )}

          {paymentDetails && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Details:</Label>
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <div className="flex-1 text-sm font-mono break-all">
                  {paymentDetails}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyDetails}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Please complete the payment using the QR code or payment details
              above, then click the button below to confirm.
            </div>

            <Button onClick={onPaymentConfirm} className="w-full" size="lg">
              I Have Completed the Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
