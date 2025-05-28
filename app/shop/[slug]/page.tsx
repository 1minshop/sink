"use client";

import { useParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Heart, Star } from "lucide-react";
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

          {/* Price and Rating */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-gray-900">
                ${product.price}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                {product.currency}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">4.5</span>
            </div>
          </div>

          {/* Stock Info */}
          {product.active && product.inventory !== null && (
            <div className="text-xs text-gray-500 mb-3">
              {product.inventory > 0 ? (
                <span>In Stock ({product.inventory} available)</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={
              !product.active ||
              (product.inventory !== null && product.inventory <= 0)
            }
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
      <div className="text-center py-12">
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products available
        </h3>
        <p className="text-gray-500">
          This store doesn't have any products available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {activeProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function ShopPage() {
  const params = useParams();
  const shopName = params.slug as string;

  // Fetch products - in a real app, you'd filter by shop owner
  const {
    data: products = [],
    error,
    isLoading,
  } = useSWR<Product[]>("/api/products", fetcher);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ShopHeader shopName={shopName} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Store Not Found
            </h2>
            <p className="text-gray-600">
              The store "{shopName}" could not be found or is currently
              unavailable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader shopName={shopName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Info Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
            Welcome to {shopName} Store
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-96 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 {shopName} Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
