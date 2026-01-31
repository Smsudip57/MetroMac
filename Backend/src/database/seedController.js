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

// ==================== RESET DATABASE ====================
export async function resetDemoData() {
  try {
    console.log("\x1b[31m⚠️  Resetting all demo data...\x1b[0m");

    // Delete in reverse order of dependencies to avoid FK constraint issues
    await prisma.taskAlert.deleteMany({});
    console.log("\x1b[33m✓ Deleted all task alerts\x1b[0m");

    await prisma.taskFile.deleteMany({});
    console.log("\x1b[33m✓ Deleted all task files\x1b[0m");

    await prisma.taskComment.deleteMany({});
    console.log("\x1b[33m✓ Deleted all task comments\x1b[0m");

    await prisma.task.deleteMany({});
    console.log("\x1b[33m✓ Deleted all tasks\x1b[0m");

    await prisma.pushSubscription.deleteMany({});
    console.log("\x1b[33m✓ Deleted all push subscriptions\x1b[0m");

    await prisma.userPermission.deleteMany({});
    console.log("\x1b[33m✓ Deleted all user permissions\x1b[0m");

    // Delete non-super users (keep the super admin)
    const superUsers = await prisma.user.findMany({
      where: { is_super_user: true },
    });
    const superUserIds = superUsers.map((u) => u.id);

    await prisma.user.deleteMany({
      where: {
        is_super_user: false,
      },
    });
    console.log("\x1b[33m✓ Deleted all demo users (kept super admin)\x1b[0m");

    console.log("\x1b[32m✅ Demo data reset successfully!\x1b[0m\n");
  } catch (error) {
    console.error("Error resetting demo data:", error.message);
    throw error;
  }
}

// ==================== SEED USERS ====================
export async function seedUsers() {
  try {
    console.log("\x1b[34mSeeding users...\x1b[0m");

    // Get all roles
    const roles = await prisma.role.findMany();
    if (roles.length === 0) {
      console.warn(
        "\x1b[33mNo roles found. Please create roles before seeding users.\x1b[0m"
      );
      return [];
    }

    console.log(`\x1b[36mFound ${roles.length} roles: ${roles.map((r) => r.name).join(", ")}\x1b[0m`);

    // Sample user data with varied profiles
    const userData = [
      {
        username: "john.doe",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@metromac.com",
        phone: "+971501234567",
        defaultLanguage: "en",
        company_name: "Metro Systems Inc",
        password: "SecurePass@123",
      },
      {
        username: "jane.smith",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@metromac.com",
        phone: "+971502234567",
        defaultLanguage: "en",
        company_name: "Transit Solutions",
        password: "SecurePass@456",
      },
      {
        username: "ahmed.khalid",
        firstName: "Ahmed",
        lastName: "Khalid",
        email: "ahmed.khalid@metromac.com",
        phone: "+971503234567",
        defaultLanguage: "ar",
        company_name: "Arab Transport",
        password: "SecurePass@789",
      },
      {
        username: "sarah.wilson",
        firstName: "Sarah",
        lastName: "Wilson",
        email: "sarah.wilson@metromac.com",
        phone: "+971504234567",
        defaultLanguage: "en",
        company_name: "Global Logistics",
        password: "SecurePass@101",
      },
      {
        username: "carlos.rodriguez",
        firstName: "Carlos",
        lastName: "Rodriguez",
        email: "carlos.rodriguez@metromac.com",
        phone: "+971505234567",
        defaultLanguage: "es",
        company_name: "Iberian Express",
        password: "SecurePass@102",
      },
      {
        username: "maria.garcia",
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria.garcia@metromac.com",
        phone: "+971506234567",
        defaultLanguage: "es",
        company_name: "European Freight",
        password: "SecurePass@103",
      },
      {
        username: "david.chen",
        firstName: "David",
        lastName: "Chen",
        email: "david.chen@metromac.com",
        phone: "+971507234567",
        defaultLanguage: "en",
        company_name: "Asia Pacific Logistics",
        password: "SecurePass@104",
      },
      {
        username: "emily.brown",
        firstName: "Emily",
        lastName: "Brown",
        email: "emily.brown@metromac.com",
        phone: "+971508234567",
        defaultLanguage: "en",
        company_name: "Northern Shipping",
        password: "SecurePass@105",
      },
      {
        username: "priya.sharma",
        firstName: "Priya",
        lastName: "Sharma",
        email: "priya.sharma@metromac.com",
        phone: "+971509234567",
        defaultLanguage: "en",
        company_name: "India Express",
        password: "SecurePass@106",
      },
      {
        username: "michael.johnson",
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@metromac.com",
        phone: "+971510234567",
        defaultLanguage: "en",
        company_name: "Continental Freight",
        password: "SecurePass@107",
      },
    ];

    const createdUsers = [];
    for (const user of userData) {
      const existingUser = await prisma.user.findUnique({
        where: { username: user.username },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(
          user.password,
          Number(config.bcrypt_salt_rounds)
        );

        // Assign a random role from available roles
        const randomRole = roles[Math.floor(Math.random() * roles.length)];

        const newUser = await prisma.user.create({
          data: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            defaultLanguage: user.defaultLanguage,
            company_name: user.company_name,
            password: hashedPassword,
            is_verified: true,
            role_id: randomRole.id,
          },
        });
        createdUsers.push(newUser);
        console.log(
          `\x1b[32m✓ Created user: ${newUser.username} (Role: ${randomRole.name})\x1b[0m`
        );
      }
    }

    console.log(
      `\x1b[32mTotal users seeded: ${createdUsers.length}\x1b[0m\n`
    );
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error.message);
    throw error;
  }
}

// ==================== SEED TASKS ====================
export async function seedTasks() {
  try {
    console.log("\x1b[34mSeeding tasks...\x1b[0m");

    // Get all users
    const users = await prisma.user.findMany();
    if (users.length < 3) {
      console.warn(
        "\x1b[33mNot enough users to seed tasks. Please seed users first.\x1b[0m"
      );
      return [];
    }

    // Task descriptions with varied content
    const taskDescriptions = [
      "Implement user authentication module with JWT",
      "Fix critical bug in payment gateway integration",
      "Optimize database queries for improved performance",
      "Design new dashboard UI/UX mockups",
      "Write API documentation for mobile team",
      "Conduct security audit and penetration testing",
      "Migrate legacy code to modern architecture",
      "Set up CI/CD pipeline with GitHub Actions",
      "Create unit tests for core modules",
      "Review and refactor old codebase",
      "Implement real-time notification system",
      "Configure cloud infrastructure on AWS",
      "Create backup and disaster recovery plan",
      "Optimize image compression and delivery",
      "Setup monitoring and alerting system",
      "Implement multi-language support",
      "Create mobile app responsive design",
      "Setup database replication and failover",
      "Implement email verification system",
      "Create admin dashboard analytics",
      "Fix memory leaks in production",
      "Implement rate limiting for APIs",
      "Create user onboarding workflow",
      "Setup SSL/TLS certificates",
      "Implement data encryption at rest",
    ];

    const statuses = [
      "pending",
      "submitted",
      "acknowledged",
      "on_hold",
      "rework",
      "completed",
      "cancelled",
    ];

    const createdTasks = [];

    // Generate 25 tasks with varied data
    for (let i = 0; i < 25; i++) {
      const assigneeIndex = Math.floor(Math.random() * users.length);
      const reporterIndex = Math.floor(Math.random() * users.length);
      const creatorIndex = Math.floor(Math.random() * users.length);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate varied dates (past, present, future)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 60) + 5);

      let submissionDate = null;
      let completionDate = null;

      if (
        status === "submitted" ||
        status === "acknowledged" ||
        status === "on_hold" ||
        status === "rework" ||
        status === "completed"
      ) {
        submissionDate = new Date(startDate);
        submissionDate.setDate(
          submissionDate.getDate() + Math.floor(Math.random() * 10)
        );
      }

      if (status === "completed") {
        completionDate = new Date(submissionDate);
        completionDate.setDate(
          completionDate.getDate() + Math.floor(Math.random() * 20)
        );
      }

      const holdReason =
        status === "on_hold"
          ? [
            "Waiting for client feedback",
            "Blocked by another task",
            "Resource unavailable",
            "Awaiting approval",
            "Technical investigation needed",
          ][Math.floor(Math.random() * 5)]
          : null;

      const task = await prisma.task.create({
        data: {
          title: `${taskDescriptions[i % taskDescriptions.length]} - Batch ${Math.floor(i / 5) + 1}`,
          description:
            taskDescriptions[(i + 1) % taskDescriptions.length] ||
            "Detailed task description will be added",
          assigned_to: users[assigneeIndex].id,
          reporter_id: users[reporterIndex].id,
          created_by: users[creatorIndex].id,
          start_date: startDate,
          end_date: endDate,
          status: status,
          hold_reason: holdReason,
          submission_date: submissionDate,
          completion_date: completionDate,
          is_archived: Math.random() > 0.8, // 20% chance of being archived
        },
      });

      createdTasks.push(task);
      console.log(
        `\x1b[32m✓ Created task: ${task.title} (Status: ${task.status})\x1b[0m`
      );
    }

    console.log(
      `\x1b[32mTotal tasks seeded: ${createdTasks.length}\x1b[0m\n`
    );
    return createdTasks;
  } catch (error) {
    console.error("Error seeding tasks:", error.message);
    throw error;
  }
}

// ==================== SEED TASK COMMENTS ====================
export async function seedTaskComments(tasks) {
  try {
    console.log("\x1b[34mSeeding task comments...\x1b[0m");

    if (!tasks || tasks.length === 0) {
      console.warn(
        "\x1b[33mNo tasks found. Please seed tasks first.\x1b[0m"
      );
      return [];
    }

    const users = await prisma.user.findMany();
    const comments = [
      "Great progress on this task! Keep up the good work.",
      "Please review the requirements again before proceeding.",
      "Need clarification on the implementation approach.",
      "Successfully completed the initial phase.",
      "Waiting for design team approval to continue.",
      "Fixed the issue mentioned in the last meeting.",
      "Need to test this thoroughly before deployment.",
      "All requirements have been met as discussed.",
      "Minor adjustments needed based on feedback.",
      "Ready for code review and testing phase.",
    ];

    const createdComments = [];

    for (const task of tasks.slice(0, 10)) {
      // Add comments to first 10 tasks
      const commentCount = Math.floor(Math.random() * 4) + 1; // 1-4 comments per task

      for (let i = 0; i < commentCount; i++) {
        const comment = await prisma.taskComment.create({
          data: {
            content: comments[Math.floor(Math.random() * comments.length)],
            task_id: task.id,
            user_id: users[Math.floor(Math.random() * users.length)].id,
          },
        });
        createdComments.push(comment);
      }

      console.log(
        `\x1b[32m✓ Added ${commentCount} comments to task: ${task.title}\x1b[0m`
      );
    }

    console.log(
      `\x1b[32mTotal task comments seeded: ${createdComments.length}\x1b[0m\n`
    );
    return createdComments;
  } catch (error) {
    console.error("Error seeding task comments:", error.message);
    throw error;
  }
}

// ==================== COMPLETE SEEDING FUNCTION ====================
export async function seedAllDemoData() {
  try {
    console.log("\x1b[34m\n🚀 Starting complete demo data seeding...\x1b[0m\n");

    await seedUsers();
    const tasks = await seedTasks();
    await seedTaskComments(tasks);

    console.log("\x1b[32m✅ All demo data seeded successfully! 🎉\x1b[0m\n");
  } catch (error) {
    console.error("Error in complete demo data seeding:", error.message);
    throw error;
  }
}
