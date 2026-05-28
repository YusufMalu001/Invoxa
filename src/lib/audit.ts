import { prisma } from './prisma';

export async function logAction(
  entityType: string,
  entityId: string,
  action: string,
  changedFields?: any,
  userId?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        changedFields: changedFields ? changedFields : undefined,
        userId,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
