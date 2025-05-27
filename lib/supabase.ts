import { createClient } from "@supabase/supabase-js";

// Get these from your Supabase project settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for product images
export const PRODUCTS_BUCKET = "product-images";

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload
 * @param fileName - The name for the file
 * @returns Promise with the public URL or error
 */
export async function uploadProductImage(file: File, fileName: string) {
  try {
    console.log("📡 uploadProductImage called with:", {
      fileName,
      fileType: file.type,
      fileSize: file.size,
      bucketName: PRODUCTS_BUCKET,
      supabaseUrl: supabaseUrl
        ? `${supabaseUrl.substring(0, 30)}...`
        : "MISSING",
      hasSupabaseClient: !!supabase,
    });

    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    // Upload the file
    const { data, error } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false, // Don't replace - use unique filenames instead
      });

    console.log("📡 Supabase storage upload response:", { data, error });

    if (error) {
      console.error("❌ Supabase storage error:", error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error("Upload succeeded but no data returned");
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(PRODUCTS_BUCKET)
      .getPublicUrl(fileName);

    console.log("🔗 Public URL generated:", urlData);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to generate public URL");
    }

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("❌ Error uploading image:", error);
    console.error("❌ Error type:", typeof error);
    console.error("❌ Error instanceof Error:", error instanceof Error);

    let errorMessage = "Upload failed";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object" && "message" in error) {
      errorMessage = String(error.message);
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param fileName - The name of the file to delete
 */
export async function deleteProductImage(fileName: string) {
  try {
    const { error } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .remove([fileName]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}
