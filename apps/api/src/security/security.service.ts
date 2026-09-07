import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now, toInstant } from '../common/utils/temporal.js';
import { BlockIpDto } from './dto/block-ip.dto.js';
import { BlockUserDto } from './dto/block-user.dto.js';
import { SecurityEventsQueryDto } from './dto/security-events-query.dto.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SecurityService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Dashboard ────────────────────────────────────────────────────────────

  async getDashboard(): Promise<any> {
    const [blockedIps, blockedUsers, recentHighEvents, recentFailedLogins] = await Promise.all([
      this.prisma.orm.public.BlockedIp.aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.BlockedUser.aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.SecurityEvent
        .where({ severity: 'HIGH' })
        .orderBy(m => (m as any).createdAt.desc())
        .limit(5)
        .all(),
      this.prisma.orm.public.LoginAttempt
        .where({ success: false })
        .orderBy(m => (m as any).createdAt.desc())
        .limit(5)
        .all(),
    ]);

    return { blockedIps, blockedUsers, recentHighSeverityEvents: recentHighEvents, recentFailedLogins };
  }

  // ─── Security Events ──────────────────────────────────────────────────────

  async getSecurityEvents(query: SecurityEventsQueryDto) {
    const filters: Record<string, unknown> = {};
    if (query.userId) filters['userId'] = query.userId;
    if (query.eventType) filters['eventType'] = query.eventType;
    if (query.severity) filters['severity'] = query.severity;

    return this.prisma.orm.public.SecurityEvent
      .where(filters)
      .orderBy(m => (m as any).createdAt.desc())
      .limit(query.limit ?? 50)
      .offset(query.offset ?? 0)
      .all();
  }

  async getSecurityEvent(id: string) {
    const event = await this.prisma.orm.public.SecurityEvent.where({ id }).first();
    if (!event) throw new NotFoundException('Security event not found');
    return event;
  }

  // ─── Login Attempts ───────────────────────────────────────────────────────

  async getLoginAttempts(userId?: string, limit = 50, offset = 0) {
    const filters: Record<string, unknown> = {};
    if (userId) filters['userId'] = userId;
    return this.prisma.orm.public.LoginAttempt
      .where(filters)
      .orderBy(m => (m as any).createdAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  async getLoginHistory(userId: string, limit = 30, offset = 0) {
    return this.prisma.orm.public.LoginAttempt
      .where({ userId, success: true })
      .orderBy(m => (m as any).createdAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  // ─── IP Blocking ──────────────────────────────────────────────────────────

  async getBlockedIps() {
    return this.prisma.orm.public.BlockedIp
      .orderBy(m => (m as any).blockedAt.desc())
      .all();
  }

  async blockIp(dto: BlockIpDto, blockedById: string) {
    const existing = await this.prisma.orm.public.BlockedIp
      .where({ ipAddress: dto.ipAddress as any })
      .first();
    if (existing) throw new BadRequestException('IP is already blocked');

    return this.prisma.orm.public.BlockedIp.create({
      id: uuidv4(),
      ipAddress: dto.ipAddress as any,
      reason: dto.reason ?? null,
      blockedById,
      isPermanent: !dto.expiresAt,
      expiresAt: dto.expiresAt ? toInstant(new Date(dto.expiresAt)) : null,
    } as any);
  }

  async unblockIp(id: string) {
    const record = await this.prisma.orm.public.BlockedIp.where({ id }).first();
    if (!record) throw new NotFoundException('Blocked IP record not found');
    await this.prisma.orm.public.BlockedIp.where({ id }).delete();
    return { unblocked: true };
  }

  // ─── User Blocking ────────────────────────────────────────────────────────

  async getBlockedUsers() {
    return this.prisma.orm.public.BlockedUser
      .orderBy(m => (m as any).blockedAt.desc())
      .all();
  }

  async blockUser(userId: string, dto: BlockUserDto, blockedById: string) {
    const user = await this.prisma.orm.public.User.where({ id: userId }).first();
    if (!user) throw new NotFoundException('User not found');
    if (user.status === 'BLOCKED') throw new BadRequestException('User is already blocked');

    await this.prisma.orm.public.User.where({ id: userId }).update({
      status: 'BLOCKED',
      updatedAt: now(),
    });

    const existingBlock = await this.prisma.orm.public.BlockedUser.where({ userId }).first();
    if (!existingBlock) {
      await this.prisma.orm.public.BlockedUser.create({
        id: uuidv4(),
        userId,
        reason: dto.reason ?? null,
        blockedById,
        isPermanent: !dto.expiresAt,
        expiresAt: dto.expiresAt ? toInstant(new Date(dto.expiresAt)) : null,
      } as any);
    }

    await this.prisma.orm.public.SecurityEvent.create({
      id: uuidv4(),
      userId,
      eventType: 'ACCOUNT_BLOCKED' as any,
      severity: 'HIGH' as any,
      ipAddress: null,
      deviceId: null,
      metadata: { blockedById, reason: dto.reason ?? null },
    } as any);

    await this.prisma.orm.public.UserSession
      .where({ userId, status: 'ACTIVE' })
      .update({ status: 'REVOKED', revokedAt: now() });

    return { blocked: true };
  }

  async unblockUser(userId: string, unblockedById: string) {
    const user = await this.prisma.orm.public.User.where({ id: userId }).first();
    if (!user) throw new NotFoundException('User not found');
    if (user.status !== 'BLOCKED') throw new BadRequestException('User is not blocked');

    await this.prisma.orm.public.User.where({ id: userId }).update({
      status: 'ACTIVE',
      updatedAt: now(),
    });

    await this.prisma.orm.public.BlockedUser.where({ userId }).delete();

    await this.prisma.orm.public.SecurityEvent.create({
      id: uuidv4(),
      userId,
      eventType: 'ACCOUNT_UNBLOCKED' as any,
      severity: 'MEDIUM' as any,
      ipAddress: null,
      deviceId: null,
      metadata: { unblockedById },
    } as any);

    return { unblocked: true };
  }

  // ─── Device Management ────────────────────────────────────────────────────

  async getUserDevices(userId: string) {
    return this.prisma.orm.public.UserDevice
      .where({ userId })
      .orderBy(m => (m as any).lastSeenAt.desc())
      .all();
  }

  async revokeDevice(deviceId: string, userId: string) {
    const device = await this.prisma.orm.public.UserDevice
      .where({ id: deviceId, userId })
      .first();
    if (!device) throw new NotFoundException('Device not found');

    await this.prisma.orm.public.UserSession
      .where({ deviceId, status: 'ACTIVE' })
      .update({ status: 'REVOKED', revokedAt: now() });

    await this.prisma.orm.public.UserDevice.where({ id: deviceId }).update({
      isBlocked: true,
    });

    return { revoked: true };
  }

  async getAllDevices(limit = 50, offset = 0) {
    return this.prisma.orm.public.UserDevice
      .orderBy(m => (m as any).lastSeenAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  // ─── Active Sessions ──────────────────────────────────────────────────────

  async getActiveSessions(limit = 50, offset = 0) {
    return this.prisma.orm.public.UserSession
      .where({ status: 'ACTIVE' })
      .orderBy(m => (m as any).lastActivityAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  async forceRevokeSession(sessionId: string, revokedById: string) {
    const session = await this.prisma.orm.public.UserSession.where({ id: sessionId }).first();
    if (!session) throw new NotFoundException('Session not found');

    await this.prisma.orm.public.UserSession.where({ id: sessionId }).update({
      status: 'REVOKED',
      revokedAt: new Date(),
    });

    await this.prisma.orm.public.SecurityEvent.create({
      id: uuidv4(),
      userId: session.userId,
      eventType: 'SESSION_REVOKED' as any,
      severity: 'MEDIUM' as any,
      ipAddress: null,
      deviceId: null,
      metadata: { sessionId, revokedById },
    } as any);

    return { revoked: true };
  }

  // ─── Audit log ────────────────────────────────────────────────────────────

  async getAuditLog(
    filters: { userId?: string; action?: string; resource?: string },
    limit = 50,
    offset = 0,
  ) {
    const where: Record<string, unknown> = {};
    if (filters.userId)   where['userId']   = filters.userId;
    if (filters.action)   where['action']   = filters.action;
    if (filters.resource) where['resource'] = filters.resource;

    return this.prisma.orm.public.AuditLog
      .where(where)
      .orderBy(m => (m as any).createdAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }
}
