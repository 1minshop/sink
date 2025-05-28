import { db } from "@/lib/db/drizzle";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface QRPaymentSettings {
  qrCodeImageUrl?: string;
  qrCodePaymentName?: string;
  qrCodePaymentDetails?: string;
  enableQrPayment: boolean;
  enableStripePayment: boolean;
}

export async function updateTeamPaymentSettings(
  teamId: number,
  settings: QRPaymentSettings
) {
  const [updatedTeam] = await db
    .update(teams)
    .set({
      ...settings,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId))
    .returning();

  return updatedTeam;
}

export async function getTeamPaymentSettings(teamId: number) {
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: {
      id: true,
      qrCodeImageUrl: true,
      qrCodePaymentName: true,
      qrCodePaymentDetails: true,
      enableQrPayment: true,
      enableStripePayment: true,
    },
  });

  return team;
}
