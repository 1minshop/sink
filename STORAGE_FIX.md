# Supabase Storage Configuration Guide

## Current Status

✅ Bucket 'product-images' exists and is accessible  
❌ Upload permissions are restricted by RLS policies

## Solution Options

### Option 1: Make Bucket Public (Easiest - Development)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Policies**
3. You'll see policies for the `objects` table in the `storage` schema
4. Click **"New Policy"**
5. Choose **"For full customization"**
6. Set policy name: `"Allow public uploads to product-images"`
7. Set the policy to:
   ```sql
   (bucket_id = 'product-images'::text)
   ```
8. Select the **INSERT** operation
9. Click **"Review"** and **"Save Policy"**

### Option 2: Create Specific RLS Policies (Recommended for Production)

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Allow anyone to view product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public uploads to product-images bucket
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Allow public access to view product images
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow anyone to delete files in product-images (optional)
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');
```

### Option 3: Quick Fix - Disable RLS for Development

**⚠️ Only for development - not recommended for production!**

1. Go to **Database** → **Tables**
2. Find the `storage.objects` table
3. Click the settings (gear) icon
4. Turn off **"Enable RLS"**

## Verification

After applying either solution, run:

```bash
node scripts/test-upload.js
```

You should see:

```
🎉 Image upload functionality is working correctly!
```

## What Each Option Does

- **Option 1**: Creates a simple policy allowing all uploads to your specific bucket
- **Option 2**: Sets up comprehensive policies for public access while maintaining security
- **Option 3**: Disables security entirely (development only)

Choose Option 1 for quick setup, or Option 2 for a production-ready configuration.
