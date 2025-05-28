import { NextRequest, NextResponse } from "next/server";
import {
  updateTeamPaymentSettings,
  getTeamPaymentSettings,
} from "@/lib/db/team-actions";
import { getTeamForUser } from "@/lib/db/queries";
import { z } from "zod";

const paymentSettingsSchema = z.object({
  qrCodeImageUrl: z.string().optional(),
  qrCodePaymentName: z.string().optional(),
  qrCodePaymentDetails: z.string().optional(),
  enableQrPayment: z.boolean(),
  enableStripePayment: z.boolean(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    let team;
    if (teamId) {
      // Guest access with teamId parameter
      const paymentSettings = await getTeamPaymentSettings(parseInt(teamId));
      if (!paymentSettings) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }
      return NextResponse.json(paymentSettings);
    } else {
      // Authenticated access (dashboard)
      team = await getTeamForUser();
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }
      const paymentSettings = await getTeamPaymentSettings(team.id);
      return NextResponse.json(paymentSettings);
    }
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = paymentSettingsSchema.parse(body);

    const updatedTeam = await updateTeamPaymentSettings(team.id, validatedData);

    return NextResponse.json({
      success: true,
      team: updatedTeam,
      message: "Payment settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating payment settings:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
