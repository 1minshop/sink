"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { useCart, useCartActions } from "@/lib/cart/cart-context";
import { useState } from "react";

interface CartSidebarProps {
  children?: React.ReactNode;
}

export function CartSidebar({ children }: CartSidebarProps) {
  const { state } = useCart();
  const { updateQuantity, removeItem, clearCart } = useCartActions();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    // TODO: Implement checkout process
    alert("Checkout coming soon! Your cart has been saved.");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children || (
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
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96 flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b border-gray-200">
          <SheetTitle className="flex items-center justify-between text-xl font-semibold">
            <span>Shopping Cart ({state.itemCount})</span>
            {state.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingCart className="h-20 w-20 text-gray-300 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
                Add some products to your cart to get started with your order.
              </p>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="w-full max-w-xs py-3"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white shadow-sm"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 truncate mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        ${item.product.price} {item.product.currency}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-semibold min-w-[2.5rem] text-center bg-gray-50 px-3 py-1 rounded-lg">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Remove Button & Total */}
                  <div className="flex flex-col items-end space-y-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <span className="text-base font-bold text-gray-900">
                      $
                      {(parseFloat(item.product.price) * item.quantity).toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary & Checkout */}
        {state.items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-6 space-y-6 bg-gray-50">
            <div className="space-y-4">
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">
                    ${state.total.toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleCheckout}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-base font-semibold"
                size="lg"
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 text-base"
              >
                Continue Shopping
              </Button>
              <p className="text-xs text-gray-500 text-center pt-2 leading-relaxed">
                No account required • Guest checkout available
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
