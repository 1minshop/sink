"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Loader2,
  PlusCircle,
  Edit,
  Trash2,
  Package,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useActionState } from "react";
import { Product } from "@/lib/db/schema";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/db/product-actions";
import useSWR from "swr";

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      // Handle case where API returns an error object
      if (data.error) {
        throw new Error(data.error);
      }
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    });

function ProductTable({
  products,
  onCreateClick,
  onEditProduct,
  onDeleteProduct,
}: {
  products: Product[];
  onCreateClick: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products yet
          </h3>
          <p className="text-gray-500 text-center mb-6">
            Get started by creating your first product
          </p>
          <Button
            onClick={onCreateClick}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Button
          onClick={onCreateClick}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Product
        </Button>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Image
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Price
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  SKU
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Inventory
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {product.currency === "INR" ? "₹ " : "$ "}
                    {product.price} {product.currency}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {product.sku || "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {product.inventory}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => onDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-md border flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onEditProduct(product)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteProduct(product.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Product Info Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {product.currency === "INR" ? "₹" : "$"}
                          {product.price} {product.currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Inventory:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {product.inventory}
                        </span>
                      </div>
                      {product.sku && (
                        <div>
                          <span className="text-gray-500">SKU:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {product.sku}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span
                          className={`ml-1 inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                            product.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateProductForm({ onCancel }: { onCancel: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [createState, createAction, isCreatePending] = useActionState<
    ActionState,
    FormData
  >(async (state, formData) => {
    try {
      await createProduct(formData);
      onCancel(); // Close form on success
      return { success: "Product created successfully" };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to create product",
      };
    }
  }, {});

  return (
    <Card className="max-w-4xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl">Create New Product</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form action={createAction} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <ImageUpload
              onImageChange={setImageUrl}
              disabled={isCreatePending}
              label="Product Image"
            />
            <input type="hidden" name="imageUrl" value={imageUrl || ""} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Product Name *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-sm font-medium">
                SKU
              </Label>
              <Input
                id="sku"
                name="sku"
                placeholder="Enter SKU"
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="Enter product description"
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Price *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">
                Currency
              </Label>
              <select
                id="currency"
                name="currency"
                defaultValue="INR"
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="INR">INR (Indian Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory" className="text-sm font-medium">
                Inventory
              </Label>
              <Input
                id="inventory"
                name="inventory"
                type="number"
                defaultValue="0"
                placeholder="0"
                className="h-10"
              />
            </div>
          </div>

          {createState?.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{createState.error}</p>
            </div>
          )}
          {createState?.success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-600 text-sm">{createState.success}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6"
              disabled={isCreatePending}
            >
              {isCreatePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function EditProductForm({
  product,
  onCancel,
}: {
  product: Product;
  onCancel: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    product.imageUrl || null
  );
  const [editState, editAction, isEditPending] = useActionState<
    ActionState,
    FormData
  >(async (state, formData) => {
    try {
      await updateProduct(product.id, formData);
      onCancel(); // Close form on success
      return { success: "Product updated successfully" };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to update product",
      };
    }
  }, {});

  return (
    <Card className="max-w-4xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl">Edit Product</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form action={editAction} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <ImageUpload
              currentImageUrl={product.imageUrl || undefined}
              onImageChange={setImageUrl}
              disabled={isEditPending}
              label="Product Image"
            />
            <input type="hidden" name="imageUrl" value={imageUrl || ""} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Product Name *
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                defaultValue={product.name}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-sm font-medium">
                SKU
              </Label>
              <Input
                id="sku"
                name="sku"
                placeholder="Enter SKU"
                defaultValue={product.sku || ""}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="Enter product description"
              defaultValue={product.description || ""}
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Price *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                defaultValue={product.price}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">
                Currency
              </Label>
              <select
                id="currency"
                name="currency"
                defaultValue={product.currency}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                <option value="BTN">BTN (Bhutanese Ngultrum)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory" className="text-sm font-medium">
                Inventory
              </Label>
              <Input
                id="inventory"
                name="inventory"
                type="number"
                placeholder="0"
                defaultValue={product.inventory || 0}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="active" className="text-sm font-medium">
              Status
            </Label>
            <select
              id="active"
              name="active"
              defaultValue={product.active ? "true" : "false"}
              className="w-full h-10 px-3 py-2 text-sm border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {editState?.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{editState.error}</p>
            </div>
          )}
          {editState?.success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-600 text-sm">{editState.success}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6"
              disabled={isEditPending}
            >
              {isEditPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ProductsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const { data: products = [], mutate } = useSWR<Product[]>(
    "/api/products",
    fetcher
  );

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setEditingProduct(null);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    mutate(); // Refresh the products list
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowCreateForm(false);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    mutate(); // Refresh the products list
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        mutate(); // Refresh the products list
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleSyncProducts = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch("/api/products/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "sync-all" }),
      });

      const result = await response.json();

      if (result.success) {
        const successCount = result.results.filter(
          (r: any) => r.success
        ).length;
        const totalCount = result.results.length;
        setSyncMessage(
          `Successfully synced ${successCount}/${totalCount} products to Stripe`
        );
        mutate(); // Refresh the products list
      } else {
        setSyncMessage("Failed to sync products to Stripe");
      }
    } catch (error) {
      console.error("Error syncing products:", error);
      setSyncMessage("Failed to sync products to Stripe");
    } finally {
      setIsSyncing(false);
      // Clear message after 5 seconds
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-lg lg:text-2xl font-medium mb-4 sm:mb-0">
          Products
        </h1>
        <div className="flex gap-2">
          {/* <Button
            onClick={handleSyncProducts}
            disabled={isSyncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync to Stripe"}
          </Button> */}
        </div>
      </div>

      {syncMessage && (
        <div
          className={`mb-4 p-3 rounded-md ${
            syncMessage.includes("Successfully")
              ? "bg-green-50 border border-green-200 text-green-600"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}
        >
          {syncMessage}
        </div>
      )}

      {showCreateForm ? (
        <CreateProductForm onCancel={handleCancelCreate} />
      ) : editingProduct ? (
        <EditProductForm product={editingProduct} onCancel={handleCancelEdit} />
      ) : (
        <ProductTable
          products={products}
          onCreateClick={handleCreateClick}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}
    </section>
  );
}
