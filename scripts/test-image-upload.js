#!/usr/bin/env node

/**
 * Test actual image file upload functionality
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const BUCKET_NAME = "product-images";

// Create a minimal test image (1x1 PNG)
function createTestPNG() {
  // This is a minimal valid 1x1 transparent PNG file in base64
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hYO9ZwAAAABJRU5ErkJggg==";
  return Buffer.from(pngBase64, "base64");
}

// Create a test JPEG
function createTestJPEG() {
  // This is a minimal valid 1x1 JPEG file in base64
  const jpegBase64 =
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==";
  return Buffer.from(jpegBase64, "base64");
}

async function testImageUpload() {
  console.log("🧪 Testing actual image file upload functionality...\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log(`🔍 Testing access to '${BUCKET_NAME}' bucket...`);

    // Test bucket access
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", { limit: 1 });

    if (listError) {
      console.error("❌ Cannot access bucket:", listError.message);
      process.exit(1);
    }

    console.log(`✅ Successfully accessed '${BUCKET_NAME}' bucket`);

    // Test 1: Upload PNG image
    console.log("\n📤 Testing PNG image upload...");
    const pngBuffer = createTestPNG();
    const pngFileName = `test-image-${Date.now()}.png`;

    const { data: pngUploadData, error: pngUploadError } =
      await supabase.storage.from(BUCKET_NAME).upload(pngFileName, pngBuffer, {
        contentType: "image/png",
      });

    if (pngUploadError) {
      console.error("❌ PNG upload failed:", pngUploadError.message);
      console.error(
        "   Error details:",
        JSON.stringify(pngUploadError, null, 2)
      );
    } else {
      console.log("✅ PNG upload successful!");
      console.log(`📄 Uploaded PNG: ${pngUploadData.path}`);

      // Get public URL
      const { data: pngUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(pngFileName);
      console.log(`🔗 PNG Public URL: ${pngUrlData.publicUrl}`);
    }

    // Test 2: Upload JPEG image
    console.log("\n📤 Testing JPEG image upload...");
    const jpegBuffer = createTestJPEG();
    const jpegFileName = `test-image-${Date.now()}.jpg`;

    const { data: jpegUploadData, error: jpegUploadError } =
      await supabase.storage
        .from(BUCKET_NAME)
        .upload(jpegFileName, jpegBuffer, {
          contentType: "image/jpeg",
        });

    if (jpegUploadError) {
      console.error("❌ JPEG upload failed:", jpegUploadError.message);
      console.error(
        "   Error details:",
        JSON.stringify(jpegUploadError, null, 2)
      );
    } else {
      console.log("✅ JPEG upload successful!");
      console.log(`📄 Uploaded JPEG: ${jpegUploadData.path}`);

      // Get public URL
      const { data: jpegUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(jpegFileName);
      console.log(`🔗 JPEG Public URL: ${jpegUrlData.publicUrl}`);
    }

    // Test 3: Upload using File-like object (similar to browser)
    console.log("\n📤 Testing File-like object upload...");
    const fileBuffer = createTestPNG();
    const fileFileName = `test-file-${Date.now()}.png`;

    // Create a File-like object similar to what the browser would create
    const fileBlob = new Blob([fileBuffer], { type: "image/png" });

    const { data: fileUploadData, error: fileUploadError } =
      await supabase.storage.from(BUCKET_NAME).upload(fileFileName, fileBlob);

    if (fileUploadError) {
      console.error(
        "❌ File-like object upload failed:",
        fileUploadError.message
      );
      console.error(
        "   Error details:",
        JSON.stringify(fileUploadError, null, 2)
      );
    } else {
      console.log("✅ File-like object upload successful!");
      console.log(`📄 Uploaded file: ${fileUploadData.path}`);

      // Get public URL
      const { data: fileUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileFileName);
      console.log(`🔗 File Public URL: ${fileUrlData.publicUrl}`);
    }

    // Clean up test files
    console.log("\n🧹 Cleaning up test files...");
    const filesToDelete = [];
    if (pngUploadData) filesToDelete.push(pngFileName);
    if (jpegUploadData) filesToDelete.push(jpegFileName);
    if (fileUploadData) filesToDelete.push(fileFileName);

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filesToDelete);

      if (deleteError) {
        console.warn("⚠️  Could not delete test files:", deleteError.message);
      } else {
        console.log("✅ Test files cleaned up");
      }
    }

    console.log("\n🎉 Image upload test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("   Full error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  testImageUpload();
}
