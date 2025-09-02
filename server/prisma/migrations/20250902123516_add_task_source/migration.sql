-- CreateEnum
CREATE TYPE "TaskSource" AS ENUM ('ADMIN', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "source" "TaskSource" NOT NULL DEFAULT 'ADMIN';
