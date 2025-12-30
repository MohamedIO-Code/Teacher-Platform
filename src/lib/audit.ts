import prisma from './prisma';

export interface AuditLogData {
    userId?: number;
    action: string;
    entity: string;
    entityId?: number;
    details?: Record<string, unknown>;
    ipAddress?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                details: data.details ? JSON.stringify(data.details) : null,
                ipAddress: data.ipAddress,
            },
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}

export async function getAuditLogs(options: {
    userId?: number;
    entity?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}) {
    const where: Record<string, unknown> = {};

    if (options.userId) where.userId = options.userId;
    if (options.entity) where.entity = options.entity;
    if (options.action) where.action = options.action;

    if (options.startDate || options.endDate) {
        where.createdAt = {};
        if (options.startDate) (where.createdAt as Record<string, unknown>).gte = options.startDate;
        if (options.endDate) (where.createdAt as Record<string, unknown>).lte = options.endDate;
    }

    return prisma.auditLog.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0,
    });
}
