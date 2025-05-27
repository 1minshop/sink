"use server";

import { db } from "./drizzle";
import { products, Product, NewProduct } from "./schema";
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
