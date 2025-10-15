/**
 * Migration script to hash existing plaintext passwords
 * Run this once to migrate from plaintext to hashed passwords
 */

import { db } from "./db";
import { users as usersTable } from "@shared/schema";
import { hashPassword } from "./auth";

async function migratePasswords() {
  console.log("Starting password migration...");
  
  try {
    // Get all users with plaintext passwords
    const allUsers = await db.query.users.findMany();
    
    console.log(`Found ${allUsers.length} users to migrate`);
    
    for (const user of allUsers) {
      // Check if password is already hashed (bcrypt hashes start with $2b$)
      if (user.password.startsWith('$2b$')) {
        console.log(`User ${user.username} already has hashed password, skipping...`);
        continue;
      }
      
      // Hash the plaintext password
      const hashedPassword = await hashPassword(user.password);
      
      // Update the user with hashed password
      await db
        .update(usersTable)
        .set({ password: hashedPassword })
        .where(eq(usersTable.id, user.id));
      
      console.log(`✓ Migrated password for user: ${user.username}`);
    }
    
    console.log("Password migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Import eq for WHERE clause
import { eq } from "drizzle-orm";

// Run migration
migratePasswords();
