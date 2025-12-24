/*
  Warnings:

  - You are about to drop the column `alerts` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "alerts";

-- CreateTable
CREATE TABLE "TaskAlert" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "alert_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskAlert_task_id_idx" ON "TaskAlert"("task_id");

-- AddForeignKey
ALTER TABLE "TaskAlert" ADD CONSTRAINT "TaskAlert_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
