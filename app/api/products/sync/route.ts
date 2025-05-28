import { NextRequest, NextResponse } from "next/server";
import {
  syncAllProductsToStripe,
  syncProductToStripe,
} from "@/lib/db/product-actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productId } = body;

    if (action === "sync-all") {
      const results = await syncAllProductsToStripe();
      return NextResponse.json({ success: true, results });
    } else if (action === "sync-one" && productId) {
      const result = await syncProductToStripe(productId);
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json(
        { error: "Invalid action or missing productId" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in product sync API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
