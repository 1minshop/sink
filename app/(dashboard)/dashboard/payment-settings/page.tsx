"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Save, CreditCard, QrCode, Upload } from "lucide-react";

interface PaymentSettings {
  enableStripePayment: boolean;
  enableQrPayment: boolean;
  qrCodeImageUrl?: string;
  qrCodePaymentName?: string;
  qrCodePaymentDetails?: string;
}

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [settings, setSettings] = useState<PaymentSettings>({
    enableStripePayment: true,
    enableQrPayment: false,
    qrCodeImageUrl: "",
    qrCodePaymentName: "",
    qrCodePaymentDetails: "",
  });

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/payment-settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            enableStripePayment: data.enableStripePayment ?? true,
            enableQrPayment: data.enableQrPayment ?? false,
            qrCodeImageUrl: data.qrCodeImageUrl || "",
            qrCodePaymentName: data.qrCodePaymentName || "",
            qrCodePaymentDetails: data.qrCodePaymentDetails || "",
          });
        }
      } catch (error) {
        console.error("Error fetching payment settings:", error);
        toast.error("Failed to load payment settings");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payment-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update payment settings");
      }

      toast.success("Payment settings updated successfully!");
    } catch (error) {
      console.error("Error updating payment settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PaymentSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure payment methods for your store
        </p>
      </div>

      {/* Stripe Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Stripe Payment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Enable Stripe Payment
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay with credit/debit cards via Stripe
              </p>
            </div>
            <Switch
              checked={settings.enableStripePayment}
              onCheckedChange={(checked) =>
                handleInputChange("enableStripePayment", checked)
              }
            />
          </div>
          {settings.enableStripePayment && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Stripe is configured and ready to accept payments. Customers
                will be redirected to Stripe's secure checkout page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>QR Code Payment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Enable QR Code Payment
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay using mobile banking or e-wallet apps
              </p>
            </div>
            <Switch
              checked={settings.enableQrPayment}
              onCheckedChange={(checked) =>
                handleInputChange("enableQrPayment", checked)
              }
            />
          </div>

          {settings.enableQrPayment && (
            <div className="space-y-6">
              <div>
                <ImageUpload
                  currentImageUrl={settings.qrCodeImageUrl || undefined}
                  onImageChange={(url) =>
                    handleInputChange("qrCodeImageUrl", url)
                  }
                  label="QR Code Image"
                  className="w-full max-w-md"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Upload your payment QR code image (recommended size:
                  500x500px)
                </p>
              </div>

              <div>
                <Label htmlFor="paymentName" className="text-base font-medium">
                  Payment Method Name
                </Label>
                <Input
                  id="paymentName"
                  value={settings.qrCodePaymentName || ""}
                  onChange={(e) =>
                    handleInputChange("qrCodePaymentName", e.target.value)
                  }
                  placeholder="e.g., Bank Transfer, Mobile Banking, mBOB"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This will be displayed to customers as the payment method name
                </p>
              </div>

              <div>
                <Label
                  htmlFor="paymentDetails"
                  className="text-base font-medium"
                >
                  Payment Details
                </Label>
                <Textarea
                  id="paymentDetails"
                  value={settings.qrCodePaymentDetails || ""}
                  onChange={(e) =>
                    handleInputChange("qrCodePaymentDetails", e.target.value)
                  }
                  placeholder="e.g., Account Number: 1234567890, Bank Name: ABC Bank, Account Holder: Store Name"
                  rows={4}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Additional payment information for customers (account details,
                  instructions, etc.)
                </p>
              </div>

              {(!settings.qrCodeImageUrl || !settings.qrCodePaymentName) && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please upload a QR code image and provide a payment method
                    name to enable QR code payments.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning if no payment methods are enabled */}
      {!settings.enableStripePayment && !settings.enableQrPayment && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800 font-medium">
              ⚠️ No payment methods are enabled. Customers won't be able to
              complete purchases until you enable at least one payment method.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
