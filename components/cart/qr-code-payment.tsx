"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, Copy, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";

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
  const [proofOfPaymentImage, setProofOfPaymentImage] = useState<string | null>(
    null
  );
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Currency conversion logic
  const usdToInrRate = 85;
  const isUSD = currency === "USD";

  const displayAmount = isUSD
    ? (parseFloat(totalAmount) * usdToInrRate).toFixed(2)
    : totalAmount;

  const displayCurrency = isUSD ? "INR" : currency;

  const handleCopyDetails = () => {
    if (paymentDetails) {
      navigator.clipboard.writeText(paymentDetails);
      setCopied(true);
      toast.success("Payment details copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!proofOfPaymentImage) {
      toast.error("Please upload proof of payment before confirming");
      return;
    }

    setIsSubmittingPayment(true);

    try {
      // Submit proof of payment to the API
      const response = await fetch("/api/orders/proof-of-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          proofOfPaymentImageUrl: proofOfPaymentImage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit proof of payment");
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Payment confirmed successfully!");

        // Call the callback to handle the redirect in the parent component
        // The checkout form will handle the proper redirect to QR confirmation page
        onPaymentConfirm();
      } else {
        throw new Error(result.error || "Failed to confirm payment");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm payment"
      );
    } finally {
      setIsSubmittingPayment(false);
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
              ₹{displayAmount} {displayCurrency}
            </div>
            {isUSD && (
              <div className="text-sm text-muted-foreground mt-1">
                Converted from ${totalAmount} USD at rate 1 USD = ₹
                {usdToInrRate}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              Order #{orderId}
            </div>
          </div>

          {qrCodeImageUrl && (
            <div className="flex justify-center">
              <div className="relative w-64 h-64 border rounded-lg overflow-hidden">
                <img
                  src={qrCodeImageUrl}
                  alt="QR Code for Payment"
                  className="w-full h-full object-contain"
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
              above, then upload proof of payment to confirm your order.
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Upload Proof of Payment:
              </Label>
              <ImageUpload
                currentImageUrl={proofOfPaymentImage || undefined}
                onImageChange={setProofOfPaymentImage}
                disabled={isSubmittingPayment}
                label="Proof of Payment"
                showLabel={false}
                maxSize={10}
              />
              {proofOfPaymentImage && (
                <div className="text-sm text-green-600 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Proof of payment uploaded successfully
                </div>
              )}
            </div>

            <Button
              onClick={handlePaymentConfirm}
              className="w-full"
              size="lg"
              disabled={!proofOfPaymentImage || isSubmittingPayment}
            >
              {isSubmittingPayment ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Confirming Payment...
                </>
              ) : (
                "Confirm Payment with Proof"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
