import { NextRequest, NextResponse } from "next/server";
import { getTeamIdByUserName } from "@/lib/db/product-actions";
import { db } from "@/lib/db/drizzle";
import { teams, users, teamMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get("subdomain");
    const teamId = searchParams.get("teamId");

    if (!subdomain && !teamId) {
      return NextResponse.json(
        { error: "Either subdomain or teamId is required" },
        { status: 400 }
      );
    }

    // If subdomain is provided, return teamId
    if (subdomain) {
      const teamIdResult = await getTeamIdByUserName(subdomain);

      if (!teamIdResult) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      return NextResponse.json({ teamId: teamIdResult });
    }

    // If teamId is provided, return subdomain
    if (teamId) {
      // Find the user who owns this team (typically the first team member with owner role)
      const teamOwner = await db
        .select({
          userName: teams.name,
          userId: teamMembers.userId,
          userRealName: users.name,
        })
        .from(teamMembers)
        .innerJoin(teams, eq(teamMembers.teamId, teams.id))
        .innerJoin(users, eq(teamMembers.userId, users.id))
        .where(eq(teams.id, parseInt(teamId)))
        .limit(1);

      if (teamOwner.length === 0) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      return NextResponse.json({
        subdomain: teamOwner[0].userRealName, // The user's name is used as subdomain
        teamId: parseInt(teamId),
      });
    }
  } catch (error) {
    console.error("Error fetching team info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
