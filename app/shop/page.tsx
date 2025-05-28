"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Star, Store, ArrowRight } from "lucide-react";
import { Product } from "@/lib/db/schema";
import { useCart, useCartActions } from "@/lib/cart/cart-context";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import Link from "next/link";
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

  // For 1minute.shop domain (e.g., shop1.1minute.shop)
  if (
    parts.length >= 3 &&
    parts[parts.length - 2] === "1minute" &&
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

function ShopHeader({
  shopName,
  subdomain,
  showCart = true,
}: {
  shopName: string;
  subdomain?: string | null;
  showCart?: boolean;
}) {
  const { state } = useCart();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 capitalize">
              {shopName} Store
            </h1>
          </div>
          {showCart && (
            <div className="flex items-center gap-4">
              <CartSidebar subdomain={subdomain}>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 relative"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {state.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {state.itemCount}
                    </span>
                  )}
                </Button>
              </CartSidebar>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartActions();

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Status Badge */}
          {!product.active && (
            <div className="absolute top-3 left-3 bg-gray-900/90 text-white px-3 py-1 text-xs rounded-full font-medium">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline mb-3">
            <span className="text-lg font-bold text-gray-900">
              {product.currency === "BTN" ? "Nu. " : "$ "}
              {product.price}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              {product.currency}
            </span>
          </div>

          {/* Stock Info */}
          {product.active && product.inventory !== null && (
            <div className="text-xs text-gray-500 mb-3">
              {product.inventory > 0 ? (
                <span className="text-green-600 font-medium">
                  In Stock ({product.inventory} available)
                </span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 transition-colors duration-200 mt-auto"
            disabled={
              !product.active ||
              (product.inventory !== null && product.inventory <= 0)
            }
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {!product.active ||
            (product.inventory !== null && product.inventory <= 0)
              ? "Out of Stock"
              : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  // Filter to show only active products in the shopfront
  const activeProducts = products.filter((product) => product.active);

  if (activeProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <Package className="mx-auto h-20 w-20 text-gray-400 mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            No products available
          </h3>
          <p className="text-gray-500 leading-relaxed">
            This store doesn't have any products available at the moment. Check
            back later for new arrivals!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-fr">
      {activeProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function WelcomePage({
  currentHost,
  currentSubdomain,
}: {
  currentHost: string;
  currentSubdomain: string | null;
}) {
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
            {currentHost.replace(/:\d+$/, "")}
          </div>
          <p className="text-sm text-gray-500">
            {currentSubdomain
              ? `You're currently viewing from subdomain: "${currentSubdomain}"`
              : "Create your own store by signing up below."}
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

export default function ShopRootPage() {
  const [currentSubdomain, setCurrentSubdomain] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentSubdomain(getSubdomainFromHost());
  }, []);

  // Fetch products for the specific subdomain if available
  const {
    data: products = [],
    error,
    isLoading,
  } = useSWR<Product[]>(
    currentSubdomain ? `/api/products?subdomain=${currentSubdomain}` : null,
    fetcher
  );

  const currentHost = isClient ? window.location.host : "1minute.shop";

  // If no subdomain, show the welcome page
  if (!currentSubdomain) {
    return (
      <WelcomePage
        currentHost={currentHost}
        currentSubdomain={currentSubdomain}
      />
    );
  }

  // If there's an error or no products found for the subdomain, show store not found
  if (error || (isClient && !isLoading && products.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ShopHeader
          shopName={currentSubdomain}
          subdomain={currentSubdomain}
          showCart={false}
        />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Store className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">
                    Store "{currentSubdomain}" Not Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <p className="text-gray-600">
                    The store you're looking for doesn't exist yet, but you can
                    create it!
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Want to claim this subdomain?
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      You can create your own store at{" "}
                      <strong>
                        {currentHost.split(".").slice(-2).join(".")}
                      </strong>{" "}
                      and start selling your products.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/sign-up" className="flex-1 max-w-xs">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Store className="w-4 h-4 mr-2" />
                          Create Your Store
                        </Button>
                      </Link>
                      <Link href="/dashboard" className="flex-1 max-w-xs">
                        <Button
                          variant="outline"
                          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          Sign In to Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">
                      What you can do with your store:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4 text-orange-500" />
                        <span>Add unlimited products</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <ShoppingCart className="w-4 h-4 text-orange-500" />
                        <span>Accept online orders</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Star className="w-4 h-4 text-orange-500" />
                        <span>Customize your storefront</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Already have an account?{" "}
                    <Link
                      href="/sign-in"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Sign in
                    </Link>{" "}
                    to manage your existing stores.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center">
              <p className="text-sm text-gray-500 font-bold">
                Made in Bhutan 🇧🇹 with ❤️
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Show the shop with products
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ShopHeader shopName={currentSubdomain} subdomain={currentSubdomain} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Store Info Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
              Welcome to {currentSubdomain} Store
            </h2>
            <p className="text-gray-600">
              Discover our amazing collection of products
            </p>
          </div>

          {/* Products Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Our Products
              </h3>
              <div className="text-sm text-gray-500">
                {isLoading
                  ? "Loading..."
                  : `${products.filter((p) => p.active).length} items`}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-fr">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="h-full animate-pulse flex flex-col">
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg"></div>
                    <div className="p-4 space-y-3 flex-grow flex flex-col">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-20 mt-2"></div>
                      <div className="h-9 bg-gray-200 rounded w-full mt-auto"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <p className="text-sm text-gray-500 font-bold">
              Made in Bhutan 🇧🇹 with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
