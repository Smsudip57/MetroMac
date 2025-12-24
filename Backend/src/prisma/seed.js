// Prisma seed script
import { seedSetup } from "../database/seedController.js";

async function main() {
  await seedSetup();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
