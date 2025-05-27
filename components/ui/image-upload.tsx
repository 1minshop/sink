"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, ImageIcon } from "lucide-react";
import { uploadProductImage } from "@/lib/supabase";

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  disabled?: boolean;
}

export function ImageUpload({
  currentImageUrl,
  onImageChange,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("🔍 File selected for upload:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("❌ Invalid file type:", file.type);
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error("❌ File too large:", file.size, "bytes");
      alert("Image size must be less than 5MB");
      return;
    }

    console.log("✅ File validation passed");
    setIsUploading(true);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      console.log("📷 Preview created:", objectUrl);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const extension = file.name.split(".").pop();
      const fileName = `product-${timestamp}-${randomString}.${extension}`;

      console.log("📤 Starting upload with filename:", fileName);

      // Upload to Supabase
      const result = await uploadProductImage(file, fileName);

      console.log("📡 Upload result:", result);

      if (result.success && result.url) {
        console.log("✅ Upload successful, URL:", result.url);
        onImageChange(result.url);
        // Clean up the object URL since we have the uploaded URL
        URL.revokeObjectURL(objectUrl);
        setPreviewUrl(result.url);
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      let errorMessage = "Failed to upload image";

      if (error instanceof Error) {
        console.error("❌ Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });

        if (
          error.message.includes("bucket") ||
          error.message.includes("not found")
        ) {
          errorMessage =
            "Storage bucket not found. Please ensure the 'product-images' bucket exists in Supabase Storage.";
        } else if (
          error.message.includes("policy") ||
          error.message.includes("permission")
        ) {
          errorMessage =
            "Permission denied. Please check Supabase Storage permissions.";
        } else {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
      // Reset on error
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Product Image</Label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Product preview"
              className="w-full h-48 object-cover rounded-md"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No image uploaded</p>
          </div>
        )}
      </div>

      {!disabled && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading
              ? "Uploading..."
              : previewUrl
              ? "Change Image"
              : "Upload Image"}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      <p className="text-xs text-gray-500">
        Supported formats: JPEG, PNG, WebP. Max size: 5MB.
      </p>
    </div>
  );
}
