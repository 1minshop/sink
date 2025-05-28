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
  className?: string;
  label?: string;
  showLabel?: boolean;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
}

export function ImageUpload({
  currentImageUrl,
  onImageChange,
  disabled,
  className = "",
  label = "Image",
  showLabel = true,
  maxSize = 5, // 5MB default
  acceptedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
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
    if (
      !acceptedFormats.some(
        (format) =>
          file.type === format ||
          file.type.startsWith(format.split("/")[0] + "/")
      )
    ) {
      console.error("❌ Invalid file type:", file.type);
      alert(
        `Please select a valid image file. Accepted formats: ${acceptedFormats.join(
          ", "
        )}`
      );
      return;
    }

    // Validate file size (default 5MB)
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      console.error("❌ File too large:", file.size, "bytes");
      alert(`Image size must be less than ${maxSize}MB`);
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
    <div className={`space-y-2 ${className}`}>
      {showLabel && <Label className="text-sm font-medium">{label}</Label>}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={`${label} preview`}
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
            <p className="mt-2 text-sm text-gray-500">
              No {label.toLowerCase()} uploaded
            </p>
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
              ? `Change ${label}`
              : `Upload ${label}`}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      <p className="text-xs text-gray-500">
        Supported formats:{" "}
        {acceptedFormats.map((f) => f.split("/")[1].toUpperCase()).join(", ")}.
        Max size: {maxSize}MB.
      </p>
    </div>
  );
}
