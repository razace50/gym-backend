-- CreateIndex
CREATE INDEX "Member_createdById_idx" ON "Member"("createdById");

-- CreateIndex
CREATE INDEX "Member_updatedById_idx" ON "Member"("updatedById");

-- CreateIndex
CREATE INDEX "Payment_memberId_idx" ON "Payment"("memberId");

-- CreateIndex
CREATE INDEX "Payment_collectedById_idx" ON "Payment"("collectedById");
