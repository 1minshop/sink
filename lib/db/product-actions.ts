"use server";

import { db } from "./drizzle";
import { products, Product, NewProduct, users, teamMembers } from "./schema";
import { eq, and, isNull } from "drizzle-orm";
import { getUser, getTeamForUser } from "./queries";
import { redirect } from "next/navigation";
import { stripe } from "../payments/stripe";

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

  try {
    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name,
      description: description || undefined,
      metadata: {
        teamId: team.id.toString(),
        sku: sku || "",
      },
      images: imageUrl ? [imageUrl] : undefined,
    });

    // Create price in Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        teamId: team.id.toString(),
      },
    });

    // Save to database
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
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    };

    await db.insert(products).values(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product. Please try again.");
  }
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

  try {
    // Get existing product to access Stripe IDs
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.teamId, team.id)))
      .limit(1);

    if (existingProduct.length === 0) {
      throw new Error("Product not found");
    }

    const product = existingProduct[0];

    // Update Stripe product if it exists
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, {
        name,
        description: description || undefined,
        active,
        metadata: {
          teamId: team.id.toString(),
          sku: sku || "",
        },
        images: imageUrl ? [imageUrl] : undefined,
      });
    }

    // If price changed, create new price in Stripe and archive old one
    if (product.stripePriceId && price !== product.price) {
      // Archive old price
      await stripe.prices.update(product.stripePriceId, {
        active: false,
      });

      // Create new price
      const newStripePrice = await stripe.prices.create({
        product: product.stripeProductId!,
        unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          teamId: team.id.toString(),
        },
      });

      // Update database with new price ID
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
          stripePriceId: newStripePrice.id,
          updatedAt: new Date(),
        })
        .where(and(eq(products.id, productId), eq(products.teamId, team.id)));
    } else {
      // Update database without changing price ID
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
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product. Please try again.");
  }
}

export async function deleteProduct(productId: number) {
  const user = await getUser();
  const team = await getTeamForUser();

  if (!user || !team) {
    redirect("/sign-in");
  }

  try {
    // Get product to access Stripe IDs
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.teamId, team.id)))
      .limit(1);

    if (existingProduct.length === 0) {
      throw new Error("Product not found");
    }

    const product = existingProduct[0];

    // Archive Stripe product (Stripe doesn't allow deletion, only archiving)
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, {
        active: false,
      });
    }

    // Archive Stripe price
    if (product.stripePriceId) {
      await stripe.prices.update(product.stripePriceId, {
        active: false,
      });
    }

    // Delete from database
    await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.teamId, team.id)));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product. Please try again.");
  }
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

export async function syncProductToStripe(productId: number) {
  const user = await getUser();
  const team = await getTeamForUser();

  if (!user || !team) {
    redirect("/sign-in");
  }

  try {
    // Get product from database
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.teamId, team.id)))
      .limit(1);

    if (existingProduct.length === 0) {
      throw new Error("Product not found");
    }

    const product = existingProduct[0];

    // Skip if already synced
    if (product.stripeProductId && product.stripePriceId) {
      return;
    }

    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description || undefined,
      active: product.active,
      metadata: {
        teamId: team.id.toString(),
        sku: product.sku || "",
        productId: product.id.toString(),
      },
      images: product.imageUrl ? [product.imageUrl] : undefined,
    });

    // Create price in Stripe
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(parseFloat(product.price) * 100), // Convert to cents
      currency: product.currency.toLowerCase(),
      metadata: {
        teamId: team.id.toString(),
        productId: product.id.toString(),
      },
    });

    // Update database with Stripe IDs
    await db
      .update(products)
      .set({
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, productId), eq(products.teamId, team.id)));

    return { stripeProductId: stripeProduct.id, stripePriceId: stripePrice.id };
  } catch (error) {
    console.error("Error syncing product to Stripe:", error);
    throw new Error("Failed to sync product to Stripe. Please try again.");
  }
}

export async function syncAllProductsToStripe() {
  const user = await getUser();
  const team = await getTeamForUser();

  if (!user || !team) {
    redirect("/sign-in");
  }

  try {
    // Get all products without Stripe IDs
    const productsToSync = await db
      .select()
      .from(products)
      .where(
        and(eq(products.teamId, team.id), isNull(products.stripeProductId))
      );

    const results = [];
    for (const product of productsToSync) {
      try {
        const result = await syncProductToStripe(product.id);
        results.push({ productId: product.id, success: true, result });
      } catch (error) {
        console.error(`Failed to sync product ${product.id}:`, error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.push({
          productId: product.id,
          success: false,
          error: errorMessage,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error syncing all products to Stripe:", error);
    throw new Error("Failed to sync products to Stripe. Please try again.");
  }
}

export async function getStripeProduct(productId: number) {
  const user = await getUser();
  const team = await getTeamForUser();

  if (!user || !team) {
    redirect("/sign-in");
  }

  try {
    // Get product from database
    const existingProduct = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.teamId, team.id)))
      .limit(1);

    if (existingProduct.length === 0) {
      throw new Error("Product not found");
    }

    const product = existingProduct[0];

    if (!product.stripeProductId) {
      return null;
    }

    // Get product from Stripe
    const stripeProduct = await stripe.products.retrieve(
      product.stripeProductId
    );

    let stripePrice = null;
    if (product.stripePriceId) {
      stripePrice = await stripe.prices.retrieve(product.stripePriceId);
    }

    return {
      product: stripeProduct,
      price: stripePrice,
    };
  } catch (error) {
    console.error("Error retrieving Stripe product:", error);
    throw new Error(
      "Failed to retrieve product from Stripe. Please try again."
    );
  }
}
