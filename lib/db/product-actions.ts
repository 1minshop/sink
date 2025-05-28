"use server";

import { db } from "./drizzle";
import { products, Product, NewProduct, users, teamMembers } from "./schema";
import { eq, and } from "drizzle-orm";
import { getUser, getTeamForUser } from "./queries";
import { redirect } from "next/navigation";

export async function getTeamProducts(): Promise<Product[]> {
  const team = await getTeamForUser();
  if (!team) {
    return [];
  }

  return db.select().from(products).where(eq(products.teamId, team.id));
}

export async function createProduct(formData: FormData) {
  const user = await getUser();
  const team = await getTeamForUser();

  if (!user || !team) {
    redirect("/sign-in");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const currency = (formData.get("currency") as string) || "USD";
  const sku = formData.get("sku") as string;
  const inventory = parseInt(formData.get("inventory") as string) || 0;
  const imageUrl = formData.get("imageUrl") as string;

  if (!name || !price) {
    throw new Error("Name and price are required");
  }

  const newProduct: NewProduct = {
    teamId: team.id,
    name,
    description: description || null,
    price,
    currency,
    sku: sku || null,
    inventory,
    active: true,
    imageUrl: imageUrl || null,
  };

  await db.insert(products).values(newProduct);
}

export async function updateProduct(productId: number, formData: FormData) {
  const user = await getUser();
  const team = await getTeamForUser();

  if (!user || !team) {
    redirect("/sign-in");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const currency = (formData.get("currency") as string) || "USD";
  const sku = formData.get("sku") as string;
  const inventory = parseInt(formData.get("inventory") as string) || 0;
  const active = formData.get("active") === "true";
  const imageUrl = formData.get("imageUrl") as string;

  await db
    .update(products)
    .set({
      name,
      description: description || null,
      price,
      currency,
      sku: sku || null,
      inventory,
      active,
      imageUrl: imageUrl || null,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, productId), eq(products.teamId, team.id)));
}

export async function deleteProduct(productId: number) {
  const user = await getUser();
  const team = await getTeamForUser();

  if (!user || !team) {
    redirect("/sign-in");
  }

  await db
    .delete(products)
    .where(and(eq(products.id, productId), eq(products.teamId, team.id)));
}

export async function getProductsByUserName(
  userName: string
): Promise<Product[]> {
  try {
    // First find the user by name
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.name, userName))
      .limit(1);

    if (user.length === 0) {
      return [];
    }

    // Then find their team
    const teamMember = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user[0].id))
      .limit(1);

    if (teamMember.length === 0) {
      return [];
    }

    // Finally get their team's products
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.teamId, teamMember[0].teamId),
          eq(products.active, true)
        )
      );
  } catch (error) {
    console.error("Error fetching products by user name:", error);
    return [];
  }
}

export async function getTeamIdByUserName(
  userName: string
): Promise<number | null> {
  try {
    // First find the user by name
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.name, userName))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    // Then find their team
    const teamMember = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user[0].id))
      .limit(1);

    if (teamMember.length === 0) {
      return null;
    }

    return teamMember[0].teamId;
  } catch (error) {
    console.error("Error fetching team ID by user name:", error);
    return null;
  }
}
