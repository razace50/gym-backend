-- CreateTable
CREATE TABLE "MembershipRenewal" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "membershipId" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipRenewal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MembershipRenewal_memberId_idx" ON "MembershipRenewal"("memberId");

-- CreateIndex
CREATE INDEX "MembershipRenewal_membershipId_idx" ON "MembershipRenewal"("membershipId");

-- AddForeignKey
ALTER TABLE "MembershipRenewal" ADD CONSTRAINT "MembershipRenewal_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRenewal" ADD CONSTRAINT "MembershipRenewal_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
