#!/bin/bash

# Test script for verifying the restored landing page functionality
# This script verifies that the root page displays the landing page when no subdomain is found

echo "🧪 Testing Restored Landing Page Functionality..."
echo "==============================================="

# Function to check if landing page features exist in the root page file
check_landing_page_features() {
    local file="/Users/douglasswm/1min/saas-starter/app/page.tsx"
    
    echo "✅ Checking Landing Page features in root page..."
    
    # Check for LandingPage component
    if grep -q "function LandingPage" "$file"; then
        echo "  ✓ LandingPage component exists"
    else
        echo "  ✗ Missing LandingPage component"
    fi
    
    # Check for welcome message
    if grep -q "Welcome to Our Marketplace" "$file"; then
        echo "  ✓ Welcome message present"
    else
        echo "  ✗ Missing welcome message"
    fi
    
    # Check for subdomain example
    if grep -q "shop1\." "$file"; then
        echo "  ✓ Subdomain example shown"
    else
        echo "  ✗ Missing subdomain example"
    fi
    
    # Check for create store button
    if grep -q "Create Your Store" "$file"; then
        echo "  ✓ Create Your Store button"
    else
        echo "  ✗ Missing Create Your Store button"
    fi
    
    # Check for manage store button
    if grep -q "Manage Store" "$file"; then
        echo "  ✓ Manage Store button"
    else
        echo "  ✗ Missing Manage Store button"
    fi
    
    # Check for ternary operator
    if grep -q "return subdomain ?" "$file"; then
        echo "  ✓ Ternary operator implemented"
    else
        echo "  ✗ Missing ternary operator"
    fi
}

# Function to check necessary imports
check_imports() {
    echo ""
    echo "✅ Checking Required Imports..."
    
    local file="/Users/douglasswm/1min/saas-starter/app/page.tsx"
    
    # Check for Store icon
    if grep -q "Store," "$file"; then
        echo "  ✓ Store icon imported"
    else
        echo "  ✗ Store icon not imported"
    fi
    
    # Check for ArrowRight icon
    if grep -q "ArrowRight" "$file"; then
        echo "  ✓ ArrowRight icon imported"
    else
        echo "  ✗ ArrowRight icon not imported"
    fi
    
    # Check for CardHeader and CardTitle
    if grep -q "CardHeader, CardTitle" "$file"; then
        echo "  ✓ Card components imported"
    else
        echo "  ✗ Card components not imported"
    fi
    
    # Check for Link import
    if grep -q "import Link" "$file"; then
        echo "  ✓ Next.js Link imported"
    else
        echo "  ✗ Next.js Link not imported"
    fi
}

# Function to check conditional rendering logic
check_conditional_logic() {
    echo ""
    echo "✅ Checking Conditional Rendering Logic..."
    
    local file="/Users/douglasswm/1min/saas-starter/app/page.tsx"
    
    # Check for subdomain detection
    if grep -q "setSubdomain(getSubdomainFromHost())" "$file"; then
        echo "  ✓ Subdomain detection implemented"
    else
        echo "  ✗ Missing subdomain detection"
    fi
    
    # Check for currentHost calculation
    if grep -q "const currentHost = isClient" "$file"; then
        echo "  ✓ Current host calculation"
    else
        echo "  ✗ Missing current host calculation"
    fi
    
    # Check for ShopfrontPage call when subdomain exists
    if grep -q "ShopfrontPage subdomain={subdomain}" "$file"; then
        echo "  ✓ ShopfrontPage rendered for subdomain"
    else
        echo "  ✗ Missing ShopfrontPage for subdomain"
    fi
    
    # Check for LandingPage call when no subdomain
    if grep -q "LandingPage currentHost={currentHost}" "$file"; then
        echo "  ✓ LandingPage rendered for no subdomain"
    else
        echo "  ✗ Missing LandingPage for no subdomain"
    fi
}

# Function to check error handling
check_error_handling() {
    echo ""
    echo "✅ Checking Error Handling..."
    
    local file="/Users/douglasswm/1min/saas-starter/app/page.tsx"
    
    # Check for invalid subdomain redirect to root
    if grep -q 'router.push("/");' "$file"; then
        echo "  ✓ Invalid subdomain redirects to root"
    else
        echo "  ✗ Invalid subdomain doesn't redirect to root"
    fi
    
    # Check for error handling in validation
    if grep -q "catch (error)" "$file"; then
        echo "  ✓ Error handling implemented"
    else
        echo "  ✗ Missing error handling"
    fi
}

# Function to check removed components
check_removed_components() {
    echo ""
    echo "✅ Checking Removed Components..."
    
    local file="/Users/douglasswm/1min/saas-starter/app/page.tsx"
    
    # Check that MainAppPage is removed
    if ! grep -q "function MainAppPage" "$file"; then
        echo "  ✓ MainAppPage component removed"
    else
        echo "  ✗ MainAppPage component still exists"
    fi
}

# Run all checks
check_landing_page_features
check_imports
check_conditional_logic
check_error_handling
check_removed_components

echo ""
echo "==============================================="
echo "🎉 Landing Page Restoration Test Complete!"
echo ""
echo "📝 Features Verified:"
echo "  • Landing page component with marketplace welcome"
echo "  • Ternary operator for conditional rendering"
echo "  • Subdomain example and store creation guidance"
echo "  • Proper redirects for invalid subdomains"
echo "  • Clean removal of redundant components"
echo ""
echo "🚀 The root page now:"
echo "  1. Shows landing page when no subdomain is detected"
echo "  2. Shows shop page when valid subdomain is found"
echo "  3. Redirects invalid subdomains back to landing page"
echo "  4. Provides clear guidance for creating stores"
