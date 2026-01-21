-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TaskStatus" ADD VALUE 'submitted';
ALTER TYPE "TaskStatus" ADD VALUE 'in_progress';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "completion_date" DATE,
ADD COLUMN     "submission_date" DATE;
