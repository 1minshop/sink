import { NextRequest, NextResponse } from "next/server";
import { getTeamIdByUserName } from "@/lib/db/product-actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get("subdomain");

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain is required" },
        { status: 400 }
      );
    }

    const teamId = await getTeamIdByUserName(subdomain);

    if (!teamId) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ teamId });
  } catch (error) {
    console.error("Error fetching team info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
