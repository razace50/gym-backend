/*
  Warnings:

  - You are about to drop the column `endDate` on the `MembershipRenewal` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `MembershipRenewal` table. All the data in the column will be lost.
  - Added the required column `newEndDate` to the `MembershipRenewal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newMembershipId` to the `MembershipRenewal` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MembershipRenewal_membershipId_idx";

-- AlterTable
ALTER TABLE "MembershipRenewal" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "newEndDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "newMembershipId" INTEGER NOT NULL,
ADD COLUMN     "oldEndDate" TIMESTAMP(3),
ADD COLUMN     "oldMembershipId" INTEGER,
ADD COLUMN     "renewedById" INTEGER;

-- CreateIndex
CREATE INDEX "MembershipRenewal_oldMembershipId_idx" ON "MembershipRenewal"("oldMembershipId");

-- CreateIndex
CREATE INDEX "MembershipRenewal_newMembershipId_idx" ON "MembershipRenewal"("newMembershipId");

-- CreateIndex
CREATE INDEX "MembershipRenewal_renewedById_idx" ON "MembershipRenewal"("renewedById");

-- AddForeignKey
ALTER TABLE "MembershipRenewal" ADD CONSTRAINT "MembershipRenewal_oldMembershipId_fkey" FOREIGN KEY ("oldMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRenewal" ADD CONSTRAINT "MembershipRenewal_newMembershipId_fkey" FOREIGN KEY ("newMembershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRenewal" ADD CONSTRAINT "MembershipRenewal_renewedById_fkey" FOREIGN KEY ("renewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
