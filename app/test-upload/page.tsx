"use client";

import { useState } from "react";
import { uploadProductImage } from "@/lib/supabase";

export default function TestUploadPage() {
  const [result, setResult] = useState<string>("");

  const testEnvironment = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("Environment check:", {
      supabaseUrl: supabaseUrl
        ? `${supabaseUrl.substring(0, 20)}...`
        : "MISSING",
      supabaseKey: supabaseKey
        ? `${supabaseKey.substring(0, 20)}...`
        : "MISSING",
    });

    setResult(
      `URL: ${supabaseUrl ? "✅ Present" : "❌ Missing"}\nKey: ${
        supabaseKey ? "✅ Present" : "❌ Missing"
      }`
    );
  };

  const testUpload = async () => {
    try {
      // Create a minimal test image file
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0, 0, 1, 1);
      }

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setResult("❌ Failed to create test image");
          return;
        }

        const testFile = new File([blob], "test.png", { type: "image/png" });
        console.log("Created test file:", testFile);

        const result = await uploadProductImage(
          testFile,
          `test-${Date.now()}.png`
        );
        console.log("Upload result:", result);

        setResult(JSON.stringify(result, null, 2));
      }, "image/png");
    } catch (error) {
      console.error("Test upload error:", error);
      setResult(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Test Page</h1>

      <div className="space-y-4">
        <button
          onClick={testEnvironment}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Environment Variables
        </button>

        <button
          onClick={testUpload}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Upload Function
        </button>

        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
          {result}
        </pre>
      </div>
    </div>
  );
}
