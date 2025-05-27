import { NextRequest, NextResponse } from "next/server";
import { getTeamProducts } from "@/lib/db/product-actions";

export async function GET(request: NextRequest) {
  try {
    const products = await getTeamProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
