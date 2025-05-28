# Subdomain Shopfront Development Guide

## Overview

The subdomain interceptor automatically routes subdomain requests to individual shopfronts, allowing users to create their own branded stores.

## How It Works

1. **Middleware Detection**: The middleware checks for subdomains in the request hostname
2. **Route Rewriting**: Requests to `subdomain.domain.com` are rewritten to `/shop/subdomain`
3. **Shopfront Rendering**: The shop page displays products for that specific store

## Local Development Setup

### Method 1: Using hosts file (Recommended)

Add entries to your `/etc/hosts` file:

```bash
# Edit hosts file
sudo nano /etc/hosts

# Add these lines:
127.0.0.1 shop1.localhost
127.0.0.1 shop2.localhost
127.0.0.1 mystore.localhost
```

Then visit:

- `http://shop1.localhost:3000` → Shows shop1's products
- `http://shop2.localhost:3000` → Shows shop2's products
- `http://localhost:3000` → Main application

### Method 2: Testing with external domains

If you have a domain, you can set up DNS A records:

- `*.yourdomain.com` → Your server IP
- Test with `shop1.yourdomain.com`

## URL Structure

- **Main App**: `localhost:3000`, `1minute.shop`, or `yourdomain.com`
- **Shopfront**: `[subdomain].localhost:3000`, `[subdomain].1minute.shop`, or `[subdomain].yourdomain.com`
- **Dashboard**: `localhost:3000/dashboard`, `1minute.shop/dashboard` (protected route)

## Examples

### Development:

- Main app: `http://localhost:3000`
- Shopfronts:
  - `http://shop1.localhost:3000`
  - `http://mystore.localhost:3000`

### Production (1minute.shop):

- Main app: `https://1minute.shop`
- Shopfronts:
  - `https://shop1.1minute.shop`
  - `https://mystore.1minute.shop`
  - `https://demo.1minute.shop`

### Production (Custom Domain):

- Main app: `https://yourdomain.com`
- Shopfronts:
  - `https://shop1.yourdomain.com`
  - `https://mystore.yourdomain.com`

## Features

### Shopfront (`/shop/[slug]/page.tsx`):

- ✅ Product grid display
- ✅ Mobile responsive design
- ✅ Product images with fallbacks
- ✅ Stock status indicators
- ✅ Add to cart buttons
- ✅ User validation (subdomain must match user name)
- ✅ Invalid subdomain redirect to /shop
- ✅ User-specific product filtering

### Middleware (`middleware.ts`):

- ✅ Subdomain detection
- ✅ Route rewriting
- ✅ Development and production support
- ✅ Preserves existing auth logic

## Testing Steps

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Add hosts entries** (see Method 1 above)

3. **Create test products** in the dashboard:

   - Visit `http://localhost:3000/dashboard`
   - Create some products with images

4. **Visit shopfront**:

   - Go to `http://shop1.localhost:3000`
   - Should see the shopfront with products

5. **Test different subdomains**:
   - `http://shop2.localhost:3000`
   - `http://mystore.localhost:3000`

## Current Limitations

1. **User-based validation**: Only users with matching names can have shopfronts
2. **No cart functionality**: Add to cart buttons are placeholders
3. **Case-sensitive matching**: Subdomain must exactly match user's name field

## Future Enhancements

1. **User-specific products**: Filter products by store owner
2. **Custom store branding**: Allow custom themes/colors
3. **Shopping cart**: Full e-commerce functionality
4. **Store settings**: Custom domain mapping
5. **Analytics**: Store-specific analytics

## Troubleshooting

### "Store Not Found" Error

- Check if hosts file entries are correct
- Ensure development server is running
- Try clearing browser cache

### Middleware Not Working

- Check browser network tab for redirects
- Verify subdomain format (no underscores)
- Test with different subdomains

### Products Not Loading

- Check `/api/products` endpoint
- Verify database connection
- Check browser console for errors

## Production Deployment

1. **DNS Setup**: Configure wildcard DNS (`*.yourdomain.com`)
2. **SSL Certificate**: Use wildcard SSL certificate
3. **Environment Variables**: Update for production domain
4. **Database**: Ensure product data is available

## Code Structure

```
middleware.ts              # Subdomain detection and routing
app/shop/
  ├── layout.tsx          # Shop layout wrapper
  ├── page.tsx            # Landing page for /shop
  └── [slug]/
      └── page.tsx        # Individual shopfront
```
