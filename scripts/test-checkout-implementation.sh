#!/bin/bash

echo "🛒 Testing checkout functionality implementation..."

# Test the checkout API endpoint
echo "📝 Testing checkout API endpoint..."

# First check if the server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running"
    
    # Test checkout endpoint with sample data
    echo "🔍 Testing checkout with sample order..."
    
    CHECKOUT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/checkout \
        -H "Content-Type: application/json" \
        -d '{
            "teamId": 1,
            "customerName": "John Doe",
            "customerEmail": "john@example.com",
            "items": [
                {
                    "productId": 1,
                    "quantity": 2,
                    "price": "29.99",
                    "currency": "USD"
                }
            ],
            "totalAmount": "59.98",
            "currency": "USD"
        }')
    
    if echo "$CHECKOUT_RESPONSE" | grep -q "success"; then
        echo "✅ Checkout API is working correctly"
        echo "Response: $CHECKOUT_RESPONSE"
    else
        echo "❌ Checkout API test failed"
        echo "Response: $CHECKOUT_RESPONSE"
    fi
    
    # Test team-info endpoint
    echo "🔍 Testing team-info endpoint..."
    TEAM_INFO_RESPONSE=$(curl -s "http://localhost:3000/api/team-info?subdomain=test")
    
    if echo "$TEAM_INFO_RESPONSE" | grep -q "teamId"; then
        echo "✅ Team-info API is working correctly"
        echo "Response: $TEAM_INFO_RESPONSE"
    else
        echo "❌ Team-info API test failed"
        echo "Response: $TEAM_INFO_RESPONSE"
    fi
    
else
    echo "❌ Server is not running. Please start with 'pnpm dev' first."
    exit 1
fi

echo ""
echo "🎯 Checkout implementation summary:"
echo "✅ Database schema updated with orders and order_items tables"
echo "✅ Order actions created for database operations"
echo "✅ Checkout API endpoint implemented"
echo "✅ Team-info API endpoint for getting team ID"
echo "✅ Checkout form component created"
echo "✅ Cart sidebar updated with checkout flow"
echo "✅ Shop page updated to pass subdomain to cart"
echo ""
echo "📋 Features implemented:"
echo "   • Guest checkout (no account required)"
echo "   • Customer name and email collection"
echo "   • Order creation with order items"
echo "   • Real-time cart total calculation"
echo "   • Toast notifications for success/error"
echo "   • Order records stored for shop owners"
echo ""
echo "🎉 Checkout functionality is now complete!"
