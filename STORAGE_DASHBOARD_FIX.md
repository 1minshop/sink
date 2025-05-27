# Fix Storage Upload Issue via Supabase Dashboard

## The Problem

Getting error: "new row violates row-level security policy" when uploading images.

## Solution: Configure Storage Policies via Dashboard

### Step 1: Go to Storage Policies

1. Open your Supabase Dashboard
2. Go to **Storage** → **Policies**
3. Find the `product-images` bucket

### Step 2: Add Required Policies

#### Policy 1: Allow Public Uploads

- **Policy Name**: `Allow public uploads to product-images`
- **Allowed Operations**: `INSERT`
- **Target Roles**: `public` (anon)
- **Policy Definition**:
  ```sql
  bucket_id = 'product-images'
  ```

#### Policy 2: Allow Public Select

- **Policy Name**: `Allow public access to product-images`
- **Allowed Operations**: `SELECT`
- **Target Roles**: `public` (anon)
- **Policy Definition**:
  ```sql
  bucket_id = 'product-images'
  ```

#### Policy 3: Allow Public Delete (for image replacement)

- **Policy Name**: `Allow public deletes from product-images`
- **Allowed Operations**: `DELETE`
- **Target Roles**: `public` (anon)
- **Policy Definition**:
  ```sql
  bucket_id = 'product-images'
  ```

#### Policy 4: Allow Public Update (for upsert)

- **Policy Name**: `Allow public updates to product-images`
- **Allowed Operations**: `UPDATE`
- **Target Roles**: `public` (anon)
- **Policy Definition**:
  ```sql
  bucket_id = 'product-images'
  ```

### Step 3: Verify Bucket Settings

1. Go to **Storage** → **Buckets**
2. Click on `product-images` bucket
3. Ensure **Public bucket** is enabled
4. Set **File size limit** to `5MB` (optional)
5. Set **Allowed MIME types** to `image/*` (optional)

### Step 4: Test Upload

After setting up the policies, try uploading an image through your app again.

## Alternative: Quick SQL Fix (if you have admin access)

If you have admin/owner access to the project, you can try this simpler SQL approach:

```sql
-- Make sure bucket is public and policies are permissive
UPDATE storage.buckets SET public = true WHERE id = 'product-images';

-- If the above policies don't work, try this more permissive approach
CREATE POLICY "Allow all operations on product-images" ON storage.objects
FOR ALL USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
```

## Troubleshooting

If you still get permission errors:

1. Check that you're logged into the correct Supabase project
2. Verify your environment variables match your project
3. Try creating a new bucket with public access from the start
4. Contact Supabase support if the issue persists
