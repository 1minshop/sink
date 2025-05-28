import { NextRequest, NextResponse } from "next/server";
import {
  getTeamProducts,
  getProductsByUserName,
} from "@/lib/db/product-actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get("subdomain");

    let products;
    if (subdomain) {
      // Get products for specific user/store
      products = await getProductsByUserName(subdomain);
    } else {
      // Get products for current user's team (dashboard view)
      products = await getTeamProducts();
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
