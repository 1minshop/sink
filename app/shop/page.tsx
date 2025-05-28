import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ShopRootPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Welcome to Our Marketplace</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            To visit a specific store, use a subdomain in your URL. For example:
          </p>
          <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
            shop1.
            {typeof window !== "undefined"
              ? window.location.host
              : "yourdomain.com"}
          </div>
          <p className="text-sm text-gray-500">
            Or create your own store by signing up below.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/sign-up" className="flex-1">
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Create Your Store
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Manage Store
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
