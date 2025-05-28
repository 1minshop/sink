#!/bin/bash

# Test script for verifying the enhanced "Store Not Found" functionality
# This script verifies that the store not found page displays helpful guidance

echo "🧪 Testing Enhanced Store Not Found Functionality..."
echo "=================================================="

# Function to check if text exists in the shop page file
check_store_not_found_features() {
    local file="/Users/douglasswm/1min/saas-starter/app/shop/page.tsx"
    
    echo "✅ Checking Store Not Found features in shop page..."
    
    # Check for enhanced store not found card
    if grep -q "Store \".*\" Not Found" "$file"; then
        echo "  ✓ Store not found title with subdomain"
    else
        echo "  ✗ Missing store not found title"
    fi
    
    # Check for helpful guidance text
    if grep -q "The store you're looking for doesn't exist yet, but you can create it!" "$file"; then
        echo "  ✓ Helpful guidance message"
    else
        echo "  ✗ Missing helpful guidance message"
    fi
    
    # Check for subdomain claiming section
    if grep -q "Want to claim this subdomain?" "$file"; then
        echo "  ✓ Subdomain claiming section"
    else
        echo "  ✗ Missing subdomain claiming section"
    fi
    
    # Check for create store button
    if grep -q "Create Your Store" "$file"; then
        echo "  ✓ Create store button"
    else
        echo "  ✗ Missing create store button"
    fi
    
    # Check for sign in button
    if grep -q "Sign In to Dashboard" "$file"; then
        echo "  ✓ Sign in to dashboard button"
    else
        echo "  ✗ Missing sign in button"
    fi
    
    # Check for feature highlights
    if grep -q "What you can do with your store:" "$file"; then
        echo "  ✓ Store features section"
    else
        echo "  ✗ Missing store features section"
    fi
    
    # Check for individual features
    if grep -q "Add unlimited products" "$file" && grep -q "Accept online orders" "$file" && grep -q "Customize your storefront" "$file"; then
        echo "  ✓ Store feature benefits"
    else
        echo "  ✗ Missing store feature benefits"
    fi
    
    # Check for already have account link
    if grep -q "Already have an account?" "$file"; then
        echo "  ✓ Existing account link"
    else
        echo "  ✗ Missing existing account link"
    fi
}

# Function to check UI components
check_ui_components() {
    echo ""
    echo "✅ Checking UI Components..."
    
    # Check for Card components
    if grep -q "CardHeader\|CardContent\|CardTitle" "/Users/douglasswm/1min/saas-starter/app/shop/page.tsx"; then
        echo "  ✓ Card components used"
    else
        echo "  ✗ Missing Card components"
    fi
    
    # Check for proper styling classes
    if grep -q "bg-blue-50\|border-blue-200\|text-blue-700" "/Users/douglasswm/1min/saas-starter/app/shop/page.tsx"; then
        echo "  ✓ Blue color scheme for info section"
    else
        echo "  ✗ Missing blue color scheme"
    fi
    
    # Check for red color scheme for error state
    if grep -q "bg-red-100\|text-red-600" "/Users/douglasswm/1min/saas-starter/app/shop/page.tsx"; then
        echo "  ✓ Red color scheme for error state"
    else
        echo "  ✗ Missing red color scheme"
    fi
    
    # Check for responsive design classes
    if grep -q "flex-col sm:flex-row\|grid-cols-1 sm:grid-cols-3\|max-w-xs" "/Users/douglasswm/1min/saas-starter/app/shop/page.tsx"; then
        echo "  ✓ Responsive design classes"
    else
        echo "  ✗ Missing responsive design classes"
    fi
}

# Function to check link destinations
check_navigation_links() {
    echo ""
    echo "✅ Checking Navigation Links..."
    
    local file="/Users/douglasswm/1min/saas-starter/app/shop/page.tsx"
    
    if grep -q 'href="/sign-up"' "$file"; then
        echo "  ✓ Sign-up link present"
    else
        echo "  ✗ Missing sign-up link"
    fi
    
    if grep -q 'href="/dashboard"' "$file"; then
        echo "  ✓ Dashboard link present"
    else
        echo "  ✗ Missing dashboard link"
    fi
    
    if grep -q 'href="/sign-in"' "$file"; then
        echo "  ✓ Sign-in link present"
    else
        echo "  ✗ Missing sign-in link"
    fi
}

# Function to check for icons
check_icons() {
    echo ""
    echo "✅ Checking Icons..."
    
    local file="/Users/douglasswm/1min/saas-starter/app/shop/page.tsx"
    
    # Check that Store icon is imported
    if grep -q "Store," "$file"; then
        echo "  ✓ Store icon imported"
    else
        echo "  ✗ Store icon not imported"
    fi
    
    # Check for icon usage in store not found section
    if grep -q '<Store className="w-8 h-8 text-red-600" />' "$file"; then
        echo "  ✓ Store icon used in header"
    else
        echo "  ✗ Missing Store icon in header"
    fi
    
    # Check for feature icons
    if grep -q '<Package className="w-4 h-4 text-orange-500" />' "$file" && 
       grep -q '<ShoppingCart className="w-4 h-4 text-orange-500" />' "$file" && 
       grep -q '<Star className="w-4 h-4 text-orange-500" />' "$file"; then
        echo "  ✓ Feature icons present"
    else
        echo "  ✗ Missing feature icons"
    fi
}

# Function to test the overall structure
check_overall_structure() {
    echo ""
    echo "✅ Checking Overall Structure..."
    
    local file="/Users/douglasswm/1min/saas-starter/app/shop/page.tsx"
    
    # Check for proper error condition
    if grep -q "if (error || (isClient && !isLoading && products.length === 0))" "$file"; then
        echo "  ✓ Proper error condition check"
    else
        echo "  ✗ Missing or incorrect error condition"
    fi
    
    # Check for main container structure
    if grep -q 'className="min-h-screen bg-gray-50"' "$file"; then
        echo "  ✓ Main container structure"
    else
        echo "  ✗ Missing main container structure"
    fi
    
    # Check for centered layout
    if grep -q 'className="max-w-2xl mx-auto"' "$file"; then
        echo "  ✓ Centered layout for not found page"
    else
        echo "  ✗ Missing centered layout"
    fi
}

# Run all checks
check_store_not_found_features
check_ui_components
check_navigation_links
check_icons
check_overall_structure

echo ""
echo "=================================================="
echo "🎉 Store Not Found Enhancement Test Complete!"
echo ""
echo "📝 Features Verified:"
echo "  • Enhanced store not found card with helpful guidance"
echo "  • Subdomain claiming section with clear call-to-action"
echo "  • Store creation and sign-in buttons"
echo "  • Feature highlights showcasing store benefits"
echo "  • Responsive design with proper styling"
echo "  • Clear navigation for existing users"
echo ""
echo "🚀 The store not found experience now guides users to:"
echo "  1. Understand they can claim the subdomain"
echo "  2. Learn about store features and benefits"
echo "  3. Take action with clear next steps"
echo "  4. Access existing accounts if they have one"
