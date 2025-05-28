"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Heart } from "lucide-react";
import { Product } from "@/lib/db/schema";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }
      return Array.isArray(data) ? data : [];
    });

function getSubdomainFromHost(): string | null {
  if (typeof window === "undefined") return null;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  // For development with custom hosts (e.g., shop1.localhost)
  if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
    const subdomain = parts[0];
    return subdomain === "localhost" ? null : subdomain;
  }

  // For 1min.shop domain (e.g., shop1.1min.shop)
  if (
    parts.length >= 3 &&
    parts[parts.length - 2] === "1min" &&
    parts[parts.length - 1] === "shop"
  ) {
    const subdomain = parts[0];
    return subdomain === "www" ? null : subdomain;
  }

  // For production domains (e.g., shop1.example.com)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

function ShopHeader({ shopName }: { shopName: string }) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 capitalize">
              {shopName} Store
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Heart className="h-4 w-4 mr-2" />
              Wishlist
            </Button>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Status Badge */}
          {!product.active && (
            <div className="absolute top-2 left-2 bg-gray-900 text-white px-2 py-1 text-xs rounded">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              ${product.price}
            </span>
            <Button
              size="sm"
              disabled={!product.active}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ShopfrontPage({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isValidStore, setIsValidStore] = useState(false);

  // Validate subdomain first
  useEffect(() => {
    const validateSubdomain = async () => {
      try {
        const response = await fetch(
          `/api/validate-subdomain?subdomain=${subdomain}`
        );
        const data = await response.json();

        if (!data.valid) {
          // Invalid subdomain, redirect to /shop
          router.push("/shop");
          return;
        }

        setIsValidStore(true);
      } catch (error) {
        console.error("Error validating subdomain:", error);
        router.push("/shop");
      } finally {
        setIsValidating(false);
      }
    };

    validateSubdomain();
  }, [subdomain, router]);

  const {
    data: products = [],
    error,
    isLoading,
  } = useSWR(
    isValidStore ? `/api/products?subdomain=${subdomain}` : null,
    fetcher
  );

  // Show loading while validating subdomain
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If not valid, this component shouldn't render (redirect should happen)
  if (!isValidStore) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Store Not Found
          </h1>
          <p className="text-gray-600">
            The store "{subdomain}" could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader shopName={subdomain} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to {subdomain.charAt(0).toUpperCase() + subdomain.slice(1)}{" "}
            Store
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our amazing collection of products, carefully curated for
            you.
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products available
            </h3>
            <p className="text-gray-600">
              This store doesn't have any products yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function MainAppPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to 1min Shop
        </h1>
        <p className="text-gray-600 mb-8">
          Create your own online store in minutes.
        </p>
        <div className="space-y-4">
          <Button className="w-full" size="lg">
            Get Started
          </Button>
          <Button variant="outline" className="w-full" size="lg">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSubdomain(getSubdomainFromHost());
  }, []);

  // Don't render anything on server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  // If subdomain exists, show shopfront
  if (subdomain) {
    return <ShopfrontPage subdomain={subdomain} />;
  }

  // Otherwise show main app
  return <MainAppPage />;
}
