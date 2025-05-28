#!/bin/bash

# Script to set up local subdomain testing for shopfront
# This adds entries to /etc/hosts for testing subdomains locally

echo "🛍️  Setting up subdomain testing for shopfront..."
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root/sudo"
    echo "   The script will prompt for sudo when needed"
    exit 1
fi

# Backup hosts file
echo "📁 Creating backup of /etc/hosts..."
sudo cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d-%H%M%S)

# Define subdomains for testing
SUBDOMAINS=("shop1" "shop2" "mystore" "teststore" "demo")

echo "🔧 Adding subdomain entries to /etc/hosts..."

for subdomain in "${SUBDOMAINS[@]}"; do
    # Check if entry already exists
    if grep -q "$subdomain.localhost" /etc/hosts; then
        echo "   ✅ $subdomain.localhost already exists"
    else
        echo "127.0.0.1 $subdomain.localhost" | sudo tee -a /etc/hosts > /dev/null
        echo "   ➕ Added $subdomain.localhost"
    fi
done

echo ""
echo "🎉 Setup complete! You can now test with:"
echo ""
for subdomain in "${SUBDOMAINS[@]}"; do
    echo "   http://$subdomain.localhost:3000"
done
echo ""
echo "📝 Main app: http://localhost:3000"
echo "📝 Dashboard: http://localhost:3000/dashboard"
echo ""
echo "🔄 To remove these entries later, restore from backup:"
echo "   sudo cp /etc/hosts.backup.* /etc/hosts"
