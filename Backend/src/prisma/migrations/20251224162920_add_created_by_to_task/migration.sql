-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "created_by" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
