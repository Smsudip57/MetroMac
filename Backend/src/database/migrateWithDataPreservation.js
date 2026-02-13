/**
 * Migration Script with Data Preservation
 * This script:
 * 1. Exports all current database data to JSON
 * 2. Deletes problematic migration files
 * 3. Creates fresh migrations
 * 4. Re-imports the data
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import pkg from "pg";
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const BACKUP_DIR = path.join(__dirname, "backups");
const BACKUP_FILE = path.join(BACKUP_DIR, `backup-${Date.now()}.json`);
const MIGRATIONS_DIR = path.join(__dirname, "..", "prisma", "migrations");

// All migration files will be deleted to create a fresh single migration
// This ensures the entire current schema is captured in one clean migration file

async function exportData() {
  console.log("[1] 📤 EXPORTING DATABASE DATA...");
  try {
    const data = {
      timestamp: new Date().toISOString(),
      users: [],
      roles: [],
      modules: [],
      permissions: [],
      rolePermissions: [],
      userPermissions: [],
      tasks: [],
      taskComments: [],
      taskFiles: [],
      taskAlerts: [],
      generalSettings: [],
      pushSubscriptions: [],
    };

    // Use raw SQL to bypass Prisma enum validation
    const databaseUrl = process.env.DATABASE_URL;
    const client = new Client({
      connectionString: databaseUrl,
    });

    await client.connect();

    try {
      // Export all data using raw SQL
      console.log("   • Exporting users...");
      const usersResult = await client.query('SELECT * FROM "User"');
      data.users = usersResult.rows;

      console.log("   • Exporting roles...");
      const rolesResult = await client.query('SELECT * FROM "Role"');
      data.roles = rolesResult.rows;

      console.log("   • Exporting modules...");
      const modulesResult = await client.query('SELECT * FROM "Module"');
      data.modules = modulesResult.rows;

      console.log("   • Exporting permissions...");
      const permissionsResult = await client.query(
        'SELECT * FROM "Permission"',
      );
      data.permissions = permissionsResult.rows;

      console.log("   • Exporting role permissions...");
      const rolePermissionsResult = await client.query(
        'SELECT * FROM "RolePermission"',
      );
      data.rolePermissions = rolePermissionsResult.rows;

      console.log("   • Exporting user permissions...");
      const userPermissionsResult = await client.query(
        'SELECT * FROM "UserPermission"',
      );
      data.userPermissions = userPermissionsResult.rows;

      console.log("   • Exporting tasks (including 'active' status values)...");
      const tasksResult = await client.query('SELECT * FROM "Task"');
      data.tasks = tasksResult.rows;

      console.log("   • Exporting task comments...");
      const taskCommentsResult = await client.query(
        'SELECT * FROM "TaskComment"',
      );
      data.taskComments = taskCommentsResult.rows;

      console.log("   • Exporting task files...");
      const taskFilesResult = await client.query('SELECT * FROM "TaskFile"');
      data.taskFiles = taskFilesResult.rows;

      console.log("   • Exporting task alerts...");
      const taskAlertsResult = await client.query('SELECT * FROM "TaskAlert"');
      data.taskAlerts = taskAlertsResult.rows;

      console.log("   • Exporting general settings...");
      const generalSettingsResult = await client.query(
        'SELECT * FROM "GeneralSetting"',
      );
      data.generalSettings = generalSettingsResult.rows;

      console.log("   • Exporting push subscriptions...");
      const pushSubscriptionsResult = await client.query(
        'SELECT * FROM "PushSubscription"',
      );
      data.pushSubscriptions = pushSubscriptionsResult.rows;
    } finally {
      await client.end();
    }

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Save to file
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
    console.log(`\n✅ Data exported successfully to: ${BACKUP_FILE}`);
    console.log(
      `   Total records: ${Object.values(data).reduce(
        (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
        0,
      )}`,
    );

    return data;
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}
function deleteAllMigrations() {
  console.log("\n[2] 🗑️  DELETING ALL MIGRATION FILES...");
  try {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log("   • Migrations directory not found (will be created)");
      return;
    }

    const migrations = fs.readdirSync(MIGRATIONS_DIR);

    if (migrations.length === 0) {
      console.log("   • No migrations found");
      return;
    }

    console.log(`   • Found ${migrations.length} migration(s) to delete`);

    migrations.forEach((migrationName) => {
      const migrationPath = path.join(MIGRATIONS_DIR, migrationName);
      // Only delete folders (migration directories)
      if (fs.statSync(migrationPath).isDirectory()) {
        console.log(`   • Deleting ${migrationName}...`);
        fs.rmSync(migrationPath, { recursive: true, force: true });
      }
    });

    console.log("✅ All migration files deleted");
  } catch (error) {
    console.error("❌ Deletion failed:", error);
    throw error;
  }
}

async function resetDatabaseCompletely() {
  console.log("\n[2.5] 🔄 RESETTING DATABASE COMPLETELY...");
  try {
    const databaseUrl = process.env.DATABASE_URL;
    const client = new Client({
      connectionString: databaseUrl,
    });

    await client.connect();

    try {
      console.log("   • Dropping all tables and types...");
      // Drop all tables in public schema
      await client.query(`
                DROP SCHEMA public CASCADE;
                CREATE SCHEMA public;
            `);

      console.log("   • Creating citext extension...");
      await client.query("CREATE EXTENSION IF NOT EXISTS citext;");
      console.log("✅ Database reset and extensions ready");
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error("❌ Failed to reset database:", error);
    throw error;
  }
}

async function resetMigrationLock() {
  console.log("\n[2.6] 🔒 RESETTING PRISMA MIGRATION STATE...");
  try {
    const migrationLockPath = path.join(
      __dirname,
      "..",
      "prisma",
      "migration_lock.toml",
    );
    if (fs.existsSync(migrationLockPath)) {
      fs.unlinkSync(migrationLockPath);
      console.log("   • Removed migration_lock.toml");
    }
    console.log("✅ Prisma migration state reset");
  } catch (error) {
    console.error("❌ Failed to reset migration lock:", error);
    throw error;
  }
}

function createFreshMigrations() {
  console.log("\n[3] 🔄 CREATING FRESH MIGRATION FILE...");
  try {
    const projectRoot = path.join(__dirname, "..", "..");

    // Use prisma migrate dev to CREATE a new migration file
    // This is needed only in development - production will use migrate deploy
    console.log("   • Creating fresh migration from current schema...");

    execSync(
      "npx prisma migrate dev --name init_schema --schema=src/prisma/schema.prisma",
      { cwd: projectRoot, stdio: "inherit" },
    );

    console.log("✅ Fresh migration file created and applied locally");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
}

async function reimportData(data) {
  console.log("\n[4] 📥 RE-IMPORTING DATA...");
  try {
    // Disable foreign key constraints temporarily (PostgreSQL specific)
    // First re-import core data
    console.log("   • Re-importing roles...");
    for (const role of data.roles) {
      await prisma.role.upsert({
        where: { id: role.id },
        update: role,
        create: role,
      });
    }

    console.log("   • Re-importing users...");
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }

    console.log("   • Re-importing modules...");
    for (const module of data.modules) {
      await prisma.module.upsert({
        where: { id: module.id },
        update: module,
        create: module,
      });
    }

    console.log("   • Re-importing permissions...");
    for (const permission of data.permissions) {
      await prisma.permission.upsert({
        where: { id: permission.id },
        update: permission,
        create: permission,
      });
    }

    console.log("   • Re-importing role permissions...");
    for (const rp of data.rolePermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: rp.role_id,
            permission_id: rp.permission_id,
          },
        },
        update: rp,
        create: rp,
      });
    }

    console.log("   • Re-importing user permissions...");
    for (const up of data.userPermissions) {
      await prisma.userPermission.upsert({
        where: {
          user_id_permission_id: {
            user_id: up.user_id,
            permission_id: up.permission_id,
          },
        },
        update: up,
        create: up,
      });
    }

    // Convert old status values to new ones
    console.log("   • Re-importing tasks (converting 'active' → 'pending')...");
    for (const task of data.tasks) {
      // Convert old 'active' status to 'pending'
      if (task.status === "active") {
        task.status = "pending";
        console.log(`      - Task ${task.id}: converted 'active' → 'pending'`);
      }
      // Convert 'in_progress' to 'acknowledged'
      if (task.status === "in_progress") {
        task.status = "acknowledged";
        console.log(
          `      - Task ${task.id}: converted 'in_progress' → 'acknowledged'`,
        );
      }

      await prisma.task.upsert({
        where: { id: task.id },
        update: task,
        create: task,
      });
    }

    console.log("   • Re-importing task comments...");
    for (const comment of data.taskComments) {
      await prisma.taskComment.upsert({
        where: { id: comment.id },
        update: comment,
        create: comment,
      });
    }

    console.log("   • Re-importing task files...");
    for (const file of data.taskFiles) {
      await prisma.taskFile.upsert({
        where: { id: file.id },
        update: file,
        create: file,
      });
    }

    console.log("   • Re-importing task alerts...");
    for (const alert of data.taskAlerts) {
      await prisma.taskAlert.upsert({
        where: { id: alert.id },
        update: alert,
        create: alert,
      });
    }

    console.log("   • Re-importing general settings...");
    for (const setting of data.generalSettings) {
      await prisma.generalSetting.upsert({
        where: { id: setting.id },
        update: setting,
        create: setting,
      });
    }

    console.log("   • Re-importing push subscriptions...");
    for (const subscription of data.pushSubscriptions) {
      await prisma.pushSubscription.upsert({
        where: { id: subscription.id },
        update: subscription,
        create: subscription,
      });
    }

    console.log("✅ Data re-imported successfully");
  } catch (error) {
    console.error("❌ Re-import failed:", error);
    throw error;
  }
}

async function main() {
  console.log("========================================");
  console.log("  DATABASE MIGRATION WITH DATA PRESERVATION");
  console.log("========================================\n");

  try {
    // Step 1: Try to export data, if it fails try to use most recent backup
    let exportedData;
    try {
      exportedData = await exportData();
    } catch (error) {
      console.warn(
        "\n⚠️  Could not export data from database (tables may not exist)",
      );
      console.log("   Attempting to restore from most recent backup...");

      // Try to find and use most recent backup
      if (fs.existsSync(BACKUP_DIR)) {
        const backups = fs
          .readdirSync(BACKUP_DIR)
          .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
          .sort()
          .reverse();

        if (backups.length > 0) {
          const mostRecentBackup = path.join(BACKUP_DIR, backups[0]);
          console.log(`✅ Found backup: ${backups[0]}`);
          const backupData = fs.readFileSync(mostRecentBackup, "utf-8");
          exportedData = JSON.parse(backupData);
          console.log(
            `✅ Loaded ${Object.values(exportedData).reduce(
              (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
              0,
            )} records from backup`,
          );
        } else {
          throw new Error("No backup files found");
        }
      } else {
        throw error;
      }
    }

    // Only proceed with deletion AFTER successful backup/restore
    console.log("\n✅ DATA READY - Now proceeding with migration...");

    // Step 2: Delete ALL migration files
    deleteAllMigrations();

    // Step 2.5: Reset database completely and create extensions
    await resetDatabaseCompletely();

    // Step 2.6: Reset Prisma migration state
    await resetMigrationLock();

    // Step 3: Create fresh migrations
    createFreshMigrations();

    // Step 4: Re-import data
    await reimportData(exportedData);

    console.log("\n========================================");
    console.log("✅ MIGRATION COMPLETED SUCCESSFULLY!");
    console.log("========================================");
    console.log(
      `\n🎉 Your database is now fixed and all data has been restored!`,
    );

    process.exit(0);
  } catch (error) {
    console.error("\n========================================");
    console.error("❌ MIGRATION FAILED!");
    console.error("========================================");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
