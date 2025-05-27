# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for product image uploads.

## Prerequisites

1. A Supabase project (create one at [supabase.com](https://supabase.com))
2. Your project's URL and anon key

## Setup Steps

### 1. Configure Environment Variables

Add your Supabase credentials to your `.env` file:

```bash
# Replace with your actual Supabase project values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to "Storage" in the sidebar
3. Click "New bucket"
4. Create a bucket named `product-images`
5. Set it as **Public** (or configure RLS policies as needed)

### 3. Configure Storage Policies (Optional)

If you want to restrict access, you can set up Row Level Security (RLS) policies:

```sql
-- Allow public read access to product images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

### 4. Test the Setup

1. Start your development server: `pnpm dev`
2. Navigate to the Products page in your dashboard
3. Try creating a new product with an image
4. Verify the image uploads and displays correctly

## Image Upload Features

- **File Validation**: Only image files (JPEG, PNG, GIF, WebP) are accepted
- **Size Limit**: Maximum file size is 5MB
- **Unique Naming**: Files are automatically renamed with timestamps to avoid conflicts
- **Preview**: Images are previewed before and after upload
- **Error Handling**: Comprehensive error messages for failed uploads
- **Cleanup**: Old images are deleted when products are updated with new images

## Troubleshooting

### Common Issues

1. **"Failed to upload image"**
   - Check your Supabase URL and anon key in `.env`
   - Verify the `product-images` bucket exists and is public
   - Check browser console for detailed error messages

2. **"Image not displaying"**
   - Verify the bucket is public or RLS policies allow read access
   - Check if the image URL is correctly stored in the database

3. **"Permission denied"**
   - Ensure the storage bucket has appropriate access policies
   - Check if authentication is required for your setup

### Debug Mode

To enable debug logging for Supabase operations, add this to your browser console:

```javascript
localStorage.setItem('supabase.auth.debug', 'true');
```

## Security Considerations

- Consider implementing file type validation on the server side
- Set up proper RLS policies if handling sensitive data
- Monitor storage usage to prevent abuse
- Implement virus scanning for uploaded files in production

## Next Steps

- Set up CDN for better image delivery performance
- Implement image resizing/optimization
- Add bulk upload functionality
- Set up backup policies for uploaded images
