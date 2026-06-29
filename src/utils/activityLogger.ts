import prisma from "../config/prisma";
type LogActivityInput = {
  action: string;
  entityType: string;
  entityId?: number;
  description: string;
  performedById?: number;
};

export const logActivity = async ({
  action,
  entityType,
  entityId,
  description,
  performedById,
}: LogActivityInput) => {
  await prisma.activityLog.create({
    data: {
      action,
      entityType,
      entityId,
      description,
      performedById,
    },
  });
};
