import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import config from "../config/index.js";

const prisma = new PrismaClient();

export async function seedSuperUser() {
  try {
    // Fetch any existing super user and any user matching the configured super admin username
    const existingSuperUser = await prisma.user.findFirst({
      where: { is_super_user: true },
    });

    const existingUsernameUser = await prisma.user.findUnique({
      where: { username: config.super_admin_username },
    });

    // Helper to parse name from config
    const namePartsFromConfig = config.super_admin_name?.split(" ") || [];
    const desiredFirstName = namePartsFromConfig[0] || "Super";
    const desiredLastName = namePartsFromConfig.slice(1).join(" ") || "Admin";
    const desiredUsername = config.super_admin_username;
    const desiredEmail = config.super_admin_email;
    const desiredPasswordPlain = config.super_admin_password;

    // If a user already exists with the desired username, prefer that record and make sure it matches env
    if (existingUsernameUser) {
      // Compute whether update is required
      const passwordMatches = await bcrypt.compare(
        desiredPasswordPlain,
        existingUsernameUser.password || ""
      );

      const needsUpdate =
        existingUsernameUser.email !== desiredEmail ||
        existingUsernameUser.firstName !== desiredFirstName ||
        existingUsernameUser.lastName !== desiredLastName ||
        !passwordMatches ||
        existingUsernameUser.is_super_user !== true;

      if (needsUpdate) {
        const updated = await prisma.user.update({
          where: { id: existingUsernameUser.id },
          data: {
            is_super_user: true,
            email: desiredEmail,
            firstName: desiredFirstName,
            lastName: desiredLastName,
            password: await bcrypt.hash(
              desiredPasswordPlain,
              Number(config.bcrypt_salt_rounds)
            ),
            is_verified: true,
          },
        });

        // If there was a different user previously marked as super user, demote them
        if (
          existingSuperUser &&
          existingSuperUser.id !== existingUsernameUser.id
        ) {
          await prisma.user.update({
            where: { id: existingSuperUser.id },
            data: { is_super_user: false },
          });
        }

        console.log(
          "\x1b[32mSuper user record updated from username match\x1b[0m"
        );
        await assignAllPermissionsToUser(updated.id);
        return updated;
      }

      // No update needed, ensure permissions and return
      console.log(
        "Super user (by username) already matches config, ensuring permissions"
      );
      await assignAllPermissionsToUser(existingUsernameUser.id);
      return existingUsernameUser;
    }

    // If we reach here there's no user with the desired username. If an existing super user exists,
    // check whether its username/name/password match the desired values; if not, update it.
    if (existingSuperUser) {
      const passwordMatches = await bcrypt.compare(
        desiredPasswordPlain,
        existingSuperUser.password || ""
      );

      const needsUpdate =
        existingSuperUser.username !== desiredUsername ||
        existingSuperUser.firstName !== desiredFirstName ||
        existingSuperUser.lastName !== desiredLastName ||
        !passwordMatches ||
        existingSuperUser.email !== desiredEmail;

      if (needsUpdate) {
        // If another record already has the desired username or email, this update may fail due to unique constraints.
        // We'll attempt to set the values on the existing super user. If there's a unique conflict, bubble the error.
        const updated = await prisma.user.update({
          where: { id: existingSuperUser.id },
          data: {
            username: desiredUsername,
            email: desiredEmail,
            firstName: desiredFirstName,
            lastName: desiredLastName,
            password: await bcrypt.hash(
              desiredPasswordPlain,
              Number(config.bcrypt_salt_rounds)
            ),
            is_super_user: true,
            is_verified: true,
          },
        });
        console.log(
          "\x1b[32mExisting super user updated to match env config\x1b[0m"
        );
        await assignAllPermissionsToUser(updated.id);
        return updated;
      }

      console.log(
        "Super user already exists and matches config, ensuring permissions"
      );
      await assignAllPermissionsToUser(existingSuperUser.id);
      return existingSuperUser;
    }

    // No super user and no user with configured username: create a new super user
    const hashedPassword = await bcrypt.hash(
      desiredPasswordPlain,
      Number(config.bcrypt_salt_rounds)
    );
    const superUser = await prisma.user.create({
      data: {
        username: desiredUsername,
        email: desiredEmail,
        firstName: desiredFirstName,
        lastName: desiredLastName,
        password: hashedPassword,
        is_super_user: true,
        is_verified: true,
      },
    });

    await assignAllPermissionsToUser(superUser.id);

    console.log("\x1b[32mSuper user created successfully\x1b[0m");
    console.log("\x1b[32mEmail: " + superUser.email + "\x1b[0m");
    console.log("\x1b[32mUsername: " + superUser.username + "\x1b[0m");
    return superUser;
    // Helper to assign all permissions to a user
    async function assignAllPermissionsToUser(userId) {
      const allPermissions = await prisma.permission.findMany({
        select: { id: true },
      });
      const data = allPermissions.map((p) => ({
        user_id: userId,
        permission_id: p.id,
      }));
      // Remove existing user permissions to avoid duplicates
      await prisma.userPermission.deleteMany({ where: { user_id: userId } });
      if (data.length) {
        await prisma.userPermission.createMany({ data, skipDuplicates: true });
      }
    }
  } catch (error) {
    console.error("Error creating super user:", error.message);
    throw error;
  }
}

export async function preventSuperUserDeletion(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user?.is_super_user) {
    throw new Error("Super user cannot be deleted");
  }

  return true;
}

// Seed GeneralSetting with type 'local'
export async function seedGeneralSetting() {
  try {
    const existing = await prisma.generalSetting.findUnique({
      where: { id: 1 },
    });
    if (existing) {
      console.log("\x1b[33mGeneralSetting already exists\x1b[0m");
      return existing;
    }
    const setting = await prisma.generalSetting.create({
      data: {
        file_storage_type: "local",
        api_key: "your-unique-api-key", // Replace with a secure value
        amazon_s3_access_key: null,
        amazon_s3_secret_key: null,
        amazon_s3_bucket: null,
        amazon_s3_region: null,
        cloudinary_cloud_name: null,
        cloudinary_api_key: null,
        cloudinary_api_secret: null,
      },
    });
    console.log("\x1b[32mGeneralSetting seeded with type 'local'\x1b[0m");
    return setting;
  } catch (error) {
    console.error("Error seeding GeneralSetting:", error.message);
    throw error;
  }
}

// Internal function to create module tree recursively
async function createModuleTree(moduleData, parentId = null) {
  try {
    const { name, permissions = [], children = [] } = moduleData;

    // Check if module already exists with same name and parent
    let module = await prisma.module.findFirst({
      where: { name, parent_id: parentId },
    });

    // Create only if doesn't exist
    if (!module) {
      module = await prisma.module.create({
        data: { name, parent_id: parentId },
      });
    }

    // Add permissions that don't already exist
    for (const action of permissions) {
      const existingPermission = await prisma.permission.findFirst({
        where: { module_id: module.id, action },
      });
      if (!existingPermission) {
        await prisma.permission.create({
          data: { module_id: module.id, action },
        });
      }
    }

    for (const child of children) {
      await createModuleTree(child, module.id);
    }
  } catch (error) {
    console.error("Error creating module tree:", error.message);
    throw error;
  }
}

// Main seeding function - handles everything (non-destructive)
export async function seedSetup() {
  try {
    console.log("\x1b[34mStarting comprehensive data seeding...\x1b[0m");

    // Import fs and path for reading data.json
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");

    // Get the directory of this file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dataPath = path.join(__dirname, "../prisma/data.json");

    // Read and parse data.json
    const raw = fs.readFileSync(dataPath, "utf-8");
    const modules = JSON.parse(raw);

    // Seed all top-level modules from data.json (only creates new ones)
    // await prisma.module.deleteMany({});
    for (const mod of modules) {
      await createModuleTree(mod);
    }

    console.log("Seeded modules and permissions from data.json");

    // Seed super user and general settings
    await seedSuperUser();
    await seedGeneralSetting();

    console.log("\x1b[32mAll essential data seeded successfully! 🎉\x1b[0m");
  } catch (error) {
    console.error("Error in comprehensive data seeding:", error.message);
    throw error;
  }
}
