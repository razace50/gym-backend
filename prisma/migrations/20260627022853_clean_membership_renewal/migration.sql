/*
  Warnings:

  - You are about to drop the column `membershipId` on the `MembershipRenewal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MembershipRenewal" DROP CONSTRAINT "MembershipRenewal_membershipId_fkey";

-- AlterTable
ALTER TABLE "MembershipRenewal" DROP COLUMN "membershipId";
