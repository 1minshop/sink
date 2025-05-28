import { NextResponse } from "next/server";
import { getTeamOrders } from "@/lib/db/order-actions";
import { getTeamForUser } from "@/lib/db/queries";

export async function GET() {
  try {
    const team = await getTeamForUser();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const orders = await getTeamOrders(team.id);

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
