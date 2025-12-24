/*
  Warnings:

  - You are about to drop the column `department_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `designation_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DepartmentPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Designation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DesignationPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DepartmentPermission" DROP CONSTRAINT "DepartmentPermission_department_id_fkey";

-- DropForeignKey
ALTER TABLE "DepartmentPermission" DROP CONSTRAINT "DepartmentPermission_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "Designation" DROP CONSTRAINT "Designation_department_id_fkey";

-- DropForeignKey
ALTER TABLE "DesignationPermission" DROP CONSTRAINT "DesignationPermission_designation_id_fkey";

-- DropForeignKey
ALTER TABLE "DesignationPermission" DROP CONSTRAINT "DesignationPermission_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_department_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_designation_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "department_id",
DROP COLUMN "designation_id";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "DepartmentPermission";

-- DropTable
DROP TABLE "Designation";

-- DropTable
DROP TABLE "DesignationPermission";
