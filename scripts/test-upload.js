#!/usr/bin/env node

/**
 * Simple test to verify image upload functionality
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const BUCKET_NAME = "product-images";

async function testImageUpload() {
  console.log("🧪 Testing image upload functionality...\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log(`🔍 Testing access to '${BUCKET_NAME}' bucket...`);

    // Test bucket access by trying to list files
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", { limit: 1 });

    if (listError) {
      console.error("❌ Cannot access bucket:", listError.message);
      if (listError.message.includes("Bucket not found")) {
        console.log("\n📋 The bucket does not exist or is not accessible");
        console.log("Please check:");
        console.log('1. Bucket name is exactly "product-images"');
        console.log("2. Bucket is set to public");
        console.log("3. Your Supabase credentials are correct");
      }
      process.exit(1);
    }

    console.log(`✅ Successfully accessed '${BUCKET_NAME}' bucket`);
    console.log(`📂 Found ${files.length} existing files`);

    // Test upload with a small test file
    console.log("\n📤 Testing file upload...");

    const testFileName = `test-upload-${Date.now()}.txt`;
    const testContent = "Test upload for image functionality verification";
    const testFile = new Blob([testContent], { type: "text/plain" });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(testFileName, testFile);

    if (uploadError) {
      console.error("❌ Upload failed:", uploadError.message);
      if (uploadError.message.includes("policy")) {
        console.log(
          "   The bucket exists but uploads are restricted by RLS policies"
        );
        console.log(
          "   For public uploads, ensure the bucket allows anonymous uploads"
        );
      }
      process.exit(1);
    }

    console.log("✅ Upload successful!");
    console.log(`📄 Uploaded file: ${uploadData.path}`);

    // Test getting public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(testFileName);

    console.log(`🔗 Public URL: ${urlData.publicUrl}`);

    // Clean up test file
    console.log("\n🧹 Cleaning up test file...");
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([testFileName]);

    if (deleteError) {
      console.warn("⚠️  Could not delete test file:", deleteError.message);
    } else {
      console.log("✅ Test file cleaned up");
    }

    console.log("\n🎉 Image upload functionality is working correctly!");
    console.log(
      "   You can now use the product image upload feature in your app."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testImageUpload().catch(console.error);
