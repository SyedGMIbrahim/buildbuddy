/*
  Warnings:

  - You are about to drop the column `resetAt` on the `Usage` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionTier` on the `Usage` table. All the data in the column will be lost.
  - Added the required column `periodEnd` to the `Usage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Usage_userId_idx";

-- DropIndex
DROP INDEX "public"."Usage_userId_key";

-- AlterTable
ALTER TABLE "public"."Usage" DROP COLUMN "resetAt",
DROP COLUMN "subscriptionTier",
ADD COLUMN     "periodEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Usage_userId_periodStart_idx" ON "public"."Usage"("userId", "periodStart");
