#!/usr/bin/env node

const { db } = require("../lib/db/drizzle");
const { users, teams, teamMembers } = require("../lib/db/schema");
const { eq } = require("drizzle-orm");

async function createTestUser() {
  try {
    console.log("Creating test user for subdomain validation...");

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.name, "test"))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(
        "Test user 'test' already exists with ID:",
        existingUser[0].id
      );
      return;
    }

    // Create test user
    const [newUser] = await db
      .insert(users)
      .values({
        name: "test",
        email: "test@example.com",
        passwordHash: "dummy_hash", // In real app, this would be properly hashed
        role: "member",
      })
      .returning();

    console.log("Created test user:", newUser);

    // Create a team for the user
    const [newTeam] = await db
      .insert(teams)
      .values({
        name: "Test Store",
      })
      .returning();

    console.log("Created test team:", newTeam);

    // Add user to team
    await db.insert(teamMembers).values({
      userId: newUser.id,
      teamId: newTeam.id,
      role: "owner",
    });

    console.log("Added user to team");
    console.log("\n✅ Test setup complete!");
    console.log("You can now visit: http://test.localhost:3000");
    console.log("This should show the shopfront for user 'test'");
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    process.exit(0);
  }
}

createTestUser();
