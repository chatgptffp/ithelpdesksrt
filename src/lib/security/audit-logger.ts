import { prisma } from '@/lib/db';

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE_TICKET = 'CREATE_TICKET',
  UPDATE_TICKET = 'UPDATE_TICKET',
  DELETE_TICKET = 'DELETE_TICKET',
  VIEW_TICKET = 'VIEW_TICKET',
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  EXPORT_DATA = 'EXPORT_DATA',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  FAILED_LOGIN = 'FAILED_LOGIN',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface AuditLogData {
  actorStaffId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export class AuditLogger {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorStaffId: data.actorStaffId || null,
          action: data.action,
          entityType: data.entityType || 'system',
          entityId: data.entityId || null,
          before: data.before ?? undefined,
          after: data.after ?? undefined,
          ip: data.ip || null,
          userAgent: data.userAgent || null,
        },
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  // Convenience methods
  static async logLogin(actorStaffId: string, ip?: string, userAgent?: string) {
    await this.log({
      actorStaffId,
      action: AuditAction.LOGIN,
      entityType: 'auth',
      ip,
      userAgent,
    });
  }

  static async logFailedLogin(email: string, ip?: string, userAgent?: string) {
    await this.log({
      action: AuditAction.FAILED_LOGIN,
      entityType: 'auth',
      after: { email },
      ip,
      userAgent,
    });
  }

  static async logTicketCreated(actorStaffId: string, ticketId: string, ticketData: Record<string, any>, ip?: string) {
    await this.log({
      actorStaffId,
      action: AuditAction.CREATE_TICKET,
      entityType: 'ticket',
      entityId: ticketId,
      after: ticketData,
      ip,
    });
  }

  static async logTicketUpdated(actorStaffId: string, ticketId: string, before: Record<string, any>, after: Record<string, any>, ip?: string) {
    await this.log({
      actorStaffId,
      action: AuditAction.UPDATE_TICKET,
      entityType: 'ticket',
      entityId: ticketId,
      before,
      after,
      ip,
    });
  }

  static async logSuspiciousActivity(description: string, actorStaffId?: string, ip?: string, details?: Record<string, any>) {
    await this.log({
      actorStaffId,
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      entityType: 'security',
      after: { description, ...details },
      ip,
    });
  }

  static async logDataExport(actorStaffId: string, exportType: string, recordCount: number, ip?: string) {
    await this.log({
      actorStaffId,
      action: AuditAction.EXPORT_DATA,
      entityType: 'data',
      after: { exportType, recordCount },
      ip,
    });
  }

  // Query methods
  static async getRecentLogs(limit: number = 100) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actorStaff: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });
  }

  static async getLogsByUser(actorStaffId: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: { actorStaffId },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getLogsByAction(action: AuditAction, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: { action },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actorStaff: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });
  }

  static async getFailedLoginAttempts(timeWindow: number = 24) {
    const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
    
    return prisma.auditLog.findMany({
      where: {
        action: AuditAction.FAILED_LOGIN,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getSuspiciousActivities(timeWindow: number = 24) {
    const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
    
    return prisma.auditLog.findMany({
      where: {
        action: AuditAction.SUSPICIOUS_ACTIVITY,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        actorStaff: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });
  }
}
