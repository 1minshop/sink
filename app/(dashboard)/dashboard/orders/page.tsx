"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Calendar,
  Mail,
  User,
  ShoppingBag,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Image,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  currency: string;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  status: string;
  totalAmount: string;
  currency: string;
  paymentMethod?: string;
  proofOfPaymentImageUrl?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-4 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <ShoppingBag className="h-4 w-4 text-orange-600" />
              </div>
              <CardTitle className="text-base font-semibold">
                Order #{order.id}
              </CardTitle>
            </div>
            <Badge
              className={`px-2 py-1 text-xs ${getStatusColor(order.status)}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {order.currency === "INR" ? "₹ " : "$ "}
                {order.totalAmount}
              </div>
              <div className="text-xs text-gray-500">{order.currency}</div>
            </div>
            <div className="flex flex-col space-y-1 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span className="truncate max-w-[140px]">
                  {order.customerName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Order #{order.id}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{order.customerName}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={`px-3 py-1 ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {order.currency === "INR" ? "₹ " : "$ "}
                {order.totalAmount}
              </div>
              <div className="text-sm text-gray-500">{order.currency}</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex flex-col space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-gray-600">
                <Mail className="h-3 w-3" />
                <span className="truncate">{order.customerEmail}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Package className="h-3 w-3" />
                <span>
                  {order.orderItems.length} item
                  {order.orderItems.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-xs"
              >
                <Eye className="h-3 w-3" />
                <span>View Details</span>
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>{order.customerEmail}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Package className="h-4 w-4" />
              <span>
                {order.orderItems.length} item
                {order.orderItems.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1"
          >
            <Eye className="h-4 w-4" />
            <span>View Details</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {item.product.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right ml-13 sm:ml-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {item.currency === "INR" ? "₹ " : "$ "}
                      {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {item.currency === "INR" ? "₹ " : "$ "}
                      {item.price} each
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Proof of Payment Section */}
            {order.paymentMethod === "qr_code" &&
              order.proofOfPaymentImageUrl && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Image className="h-4 w-4 mr-2" />
                    Proof of Payment
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300 mx-auto sm:mx-0 flex-shrink-0">
                        <img
                          src={order.proofOfPaymentImageUrl}
                          alt="Proof of payment"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            window.open(order.proofOfPaymentImageUrl, "_blank")
                          }
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="text-xs sm:text-sm text-gray-600 mb-3">
                          Customer submitted proof of payment for QR code
                          transaction
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(order.proofOfPaymentImageUrl, "_blank")
                          }
                          className="text-xs sm:text-sm w-full sm:w-auto"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const [searchEmail, setSearchEmail] = useState("");
  const {
    data: orders,
    error,
    isLoading,
  } = useSWR<Order[]>("/api/orders", fetcher);

  // Filter orders based on search email
  const filteredOrders =
    orders?.filter((order) =>
      order.customerEmail.toLowerCase().includes(searchEmail.toLowerCase())
    ) || [];

  const clearSearch = () => {
    setSearchEmail("");
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error loading orders
              </h3>
              <p className="text-gray-600">
                There was an error loading your orders. Please try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Orders
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage and view all orders from your store
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search orders by email address..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchEmail && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        {searchEmail && (
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {filteredOrders.length} order
            {filteredOrders.length !== 1 ? "s" : ""} found for &ldquo;
            {searchEmail}&rdquo;
          </p>
        )}
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                No orders yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                When customers place orders from your store, they will appear
                here. Share your store link to start receiving orders!
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 && searchEmail ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Search className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                No orders found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                No orders found for the email address &ldquo;{searchEmail}
                &rdquo;. Try a different search term.
              </p>
              <Button
                variant="outline"
                onClick={clearSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
              >
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm text-gray-600">
              {searchEmail ? (
                <>
                  Showing {filteredOrders.length} of {orders.length} order
                  {orders.length !== 1 ? "s" : ""}
                </>
              ) : (
                <>
                  {orders.length} order{orders.length !== 1 ? "s" : ""} total
                </>
              )}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
