/*
  Warnings:

  - Added the required column `userId` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_test_schema"."Tasks" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Tasks_userId_idx" ON "api_test_schema"."Tasks"("userId");
