#!/usr/bin/env node

/**
 * Test Supabase Storage connection and bucket existence
 * Run this script to verify your Supabase Storage setup
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const BUCKET_NAME = "product-images";

async function testSupabaseStorage() {
  console.log("🔍 Testing Supabase Storage connection...\n");

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing environment variables:");
    if (!supabaseUrl) console.error("  - NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseKey) console.error("  - NEXT_PUBLIC_SUPABASE_ANON_KEY");
    console.log("\n📝 Please add these to your .env file");
    process.exit(1);
  }

  console.log("✅ Environment variables found");
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test connection by listing buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("❌ Failed to connect to Supabase Storage:", error.message);
      process.exit(1);
    }

    console.log("✅ Successfully connected to Supabase Storage");
    console.log(`📁 Found ${buckets.length} bucket(s):`);

    buckets.forEach((bucket) => {
      console.log(
        `  - ${bucket.name} (${bucket.public ? "public" : "private"})`
      );
    });

    // Check for product-images bucket
    const productBucket = buckets.find((b) => b.name === BUCKET_NAME);

    if (productBucket) {
      console.log(`\n✅ Found '${BUCKET_NAME}' bucket`);
      console.log(
        `📂 Bucket is ${productBucket.public ? "public" : "private"}`
      );

      // Test upload permissions by checking policies (if possible)
      console.log("\n🧪 Testing bucket access...");

      try {
        const { data: files, error: listError } = await supabase.storage
          .from(BUCKET_NAME)
          .list("", { limit: 1 });

        if (listError) {
          console.warn("⚠️  Cannot list files in bucket:", listError.message);
          console.log(
            "   This might be due to RLS policies (which is OK for security)"
          );
        } else {
          console.log("✅ Can access bucket contents");
        }
      } catch (err) {
        console.warn("⚠️  Bucket access test failed:", err.message);
      }

      console.log("\n🎉 Setup appears to be working!");
      console.log("   You can now upload images through the application.");
    } else {
      console.error(`\n❌ Bucket '${BUCKET_NAME}' not found!`);
      console.log("\n📋 To fix this:");
      console.log("1. Go to your Supabase project dashboard");
      console.log("2. Navigate to Storage > Buckets");
      console.log('3. Click "New bucket"');
      console.log(`4. Create a bucket named '${BUCKET_NAME}'`);
      console.log("5. Set it as Public for easier access");
      console.log("6. Run this script again to verify");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Error testing Supabase Storage:", err.message);
    process.exit(1);
  }
}

// Run the test
testSupabaseStorage().catch(console.error);
