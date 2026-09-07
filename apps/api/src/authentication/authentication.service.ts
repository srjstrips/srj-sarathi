import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { now, toInstant } from '../common/utils/temporal.js';
import type { LoginDto } from './dto/login.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly authz: AuthorizationService,
  ) {}

  async login(dto: LoginDto, ip: string, userAgent: string) {
    const { username, password, deviceToken, platform, deviceModel, osVersion, appVersion, pushToken } = dto;

    // 1. Find user
    const user = await this.prisma.orm.public.User
      .where({ username: username as any })
      .first();

    // 2. Check blocked IP
    await this.checkBlockedIp(ip);

    // 3. Record attempt regardless of outcome
    const recordAttempt = async (success: boolean, reason?: string) => {
      await this.prisma.orm.public.LoginAttempt.create({
        usernameAttempted: username as any,
        ipAddress: ip as any,
        userAgent,
        success,
        failureReason: reason ?? null,
        deviceId: null,
        userId: user?.id ?? null,
      } as any);
    };

    if (!user) {
      await recordAttempt(false, 'USER_NOT_FOUND');
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Check account status
    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      await recordAttempt(false, 'ACCOUNT_BLOCKED');
      throw new ForbiddenException('Account is blocked');
    }

    if (user.status === 'INACTIVE') {
      await recordAttempt(false, 'ACCOUNT_INACTIVE');
      throw new ForbiddenException('Account is inactive');
    }

    // 5. Check lockout (recent failed attempts within lockout window)
    const lockoutSince = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);
    const recentAttempts = await this.prisma.orm.public.LoginAttempt
      .where({ userId: user.id, success: false })
      .all() as any[];
    const recentFailed = recentAttempts.filter((a: any) => {
      const ts = a.createdAt?.epochMilliseconds ?? new Date(String(a.createdAt)).getTime();
      return ts >= lockoutSince.getTime();
    }).length;

    if (recentFailed >= MAX_FAILED_ATTEMPTS) {
      await recordAttempt(false, 'ACCOUNT_LOCKED');
      throw new ForbiddenException('Too many failed attempts. Try again later.');
    }

    // 6. Verify password
    let valid = false;
    try {
      valid = await argon2.verify(user.passwordHash, password);
    } catch {
      this.logger.error('Password verification error');
    }

    if (!valid) {
      await recordAttempt(false, 'WRONG_PASSWORD');
      await this.emitSecurityEvent(user.id, 'LOGIN_FAILED', ip, null, { reason: 'WRONG_PASSWORD' }, 'MEDIUM');
      throw new UnauthorizedException('Invalid credentials');
    }

    // 7. Register/update device
    let deviceId: string | null = null;
    if (deviceToken) {
      deviceId = await this.upsertDevice(user.id, { deviceToken, platform, deviceModel, osVersion, appVersion, pushToken, ip });
    }

    // 8. Create session
    const sessionId = uuidv4();
    const accessToken = this.signAccessToken(user.id, sessionId);
    const refreshToken = this.signRefreshToken(user.id, sessionId);
    const expiresAt = toInstant(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    await this.prisma.orm.public.UserSession.create({
      id: sessionId,
      userId: user.id,
      sessionTokenHash: hashToken(accessToken),
      refreshTokenHash: hashToken(refreshToken),
      ipAddress: ip as any,
      userAgent,
      deviceId,
      appVersion: appVersion ?? null,
      status: 'ACTIVE',
      expiresAt,
      revokedAt: null,
      logoutAt: null,
    } as any);

    // 9. Update user last login
    await this.prisma.orm.public.User
      .where({ id: user.id })
      .update({ lastLoginAt: now() });

    // 10. Record success + security event
    await recordAttempt(true);
    await this.emitSecurityEvent(user.id, 'LOGIN_SUCCESS', ip, deviceId, { sessionId }, 'LOW');

    return { accessToken, refreshToken, expiresIn: 15 * 60, sessionId };
  }

  async logout(userId: string, sessionId: string, ip: string) {
    await this.prisma.orm.public.UserSession
      .where({ id: sessionId, userId })
      .update({ status: 'LOGGED_OUT', logoutAt: now() });

    await this.emitSecurityEvent(userId, 'LOGOUT', ip, null, { sessionId }, 'LOW');
  }

  async refresh(userId: string, sessionId: string, ip: string, userAgent: string) {
    const session = await this.prisma.orm.public.UserSession
      .where({ id: sessionId, userId, status: 'ACTIVE' })
      .first();

    if (!session) throw new UnauthorizedException('Session not found or expired');
    const sessionExpiry = session.expiresAt?.epochMilliseconds ?? new Date(String(session.expiresAt)).getTime();
    if (Date.now() > sessionExpiry) {
      await this.prisma.orm.public.UserSession
        .where({ id: sessionId })
        .update({ status: 'EXPIRED' });
      throw new UnauthorizedException('Session expired');
    }

    const user = await this.prisma.orm.public.User
      .where({ id: userId })
      .first();

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const newAccessToken = this.signAccessToken(userId, sessionId);
    const newRefreshToken = this.signRefreshToken(userId, sessionId);

    await this.prisma.orm.public.UserSession
      .where({ id: sessionId })
      .update({
        sessionTokenHash: hashToken(newAccessToken),
        refreshTokenHash: hashToken(newRefreshToken),
        lastActivityAt: now(),
        ipAddress: ip as any,
        userAgent,
      });

    await this.emitSecurityEvent(userId, 'SESSION_CREATED', ip, null, { sessionId }, 'LOW');

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn: 15 * 60 };
  }

  async getMe(userId: string) {
    const user = await this.prisma.orm.public.User
      .where({ id: userId })
      .include('employee' as any)
      .first();

    if (!user) throw new UnauthorizedException();

    const [roles, permissions] = await Promise.all([
      this.authz.getUserRoles(userId),
      this.authz.getUserPermissions(userId),
    ]);

    const emp = (user as any).employee;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      employee: emp
        ? {
            id: emp.id,
            employeeCode: emp.employeeCode,
            firstName: emp.firstName,
            lastName: emp.lastName,
            displayName: emp.displayName,
            profilePicUrl: emp.profilePicUrl,
            companyId: emp.companyId,
            departmentId: emp.departmentId,
          }
        : null,
      roles,
      permissions,
    };
  }

  async getSessions(userId: string) {
    return this.prisma.orm.public.UserSession
      .where({ userId, status: 'ACTIVE' })
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  async revokeSession(userId: string, sessionId: string, ip: string) {
    const session = await this.prisma.orm.public.UserSession
      .where({ id: sessionId, userId })
      .first();

    if (!session) throw new BadRequestException('Session not found');

    await this.prisma.orm.public.UserSession
      .where({ id: sessionId })
      .update({ status: 'REVOKED', revokedAt: now() });

    await this.emitSecurityEvent(userId, 'SESSION_REVOKED', ip, null, { sessionId }, 'MEDIUM');
  }

  async revokeAllSessions(userId: string, currentSessionId: string, ip: string) {
    const sessions = await this.prisma.orm.public.UserSession
      .where({ userId, status: 'ACTIVE' })
      .all() as any[];

    const others = sessions.filter((s: any) => s.id !== currentSessionId);
    for (const s of others) {
      await this.prisma.orm.public.UserSession
        .where({ id: s.id })
        .update({ status: 'REVOKED', revokedAt: now() });
    }

    await this.emitSecurityEvent(userId, 'SESSION_REVOKED', ip, null, { reason: 'revoke-all' }, 'MEDIUM');
  }

  async changePassword(userId: string, dto: ChangePasswordDto, ip: string) {
    const user = await this.prisma.orm.public.User
      .where({ id: userId })
      .first();

    if (!user) throw new UnauthorizedException();

    const valid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const newHash = await argon2.hash(dto.newPassword);
    await this.prisma.orm.public.User
      .where({ id: userId })
      .update({ passwordHash: newHash, passwordChangedAt: now() });

    await this.prisma.orm.public.UserSession
      .where({ userId, status: 'ACTIVE' })
      .update({ status: 'REVOKED', revokedAt: now() });

    await this.emitSecurityEvent(userId, 'PASSWORD_CHANGED', ip, null, {}, 'HIGH');
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private signAccessToken(userId: string, sessionId: string): string {
    return this.jwt.sign(
      { sub: userId, sessionId },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get('jwt.accessExpiresIn') as any,
      },
    );
  }

  private signRefreshToken(userId: string, sessionId: string): string {
    return this.jwt.sign(
      { sub: userId, sessionId },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get('jwt.refreshExpiresIn') as any,
      },
    );
  }

  private async upsertDevice(
    userId: string,
    info: {
      deviceToken: string;
      platform?: string;
      deviceModel?: string;
      osVersion?: string;
      appVersion?: string;
      pushToken?: string;
      ip: string;
    },
  ): Promise<string> {
    const existing = await this.prisma.orm.public.UserDevice
      .where({ deviceToken: info.deviceToken as any })
      .first();

    if (existing) {
      await this.prisma.orm.public.UserDevice
        .where({ id: existing.id })
        .update({
          lastSeenAt: now(),
          appVersion: (info.appVersion ?? existing.appVersion) as any,
          pushToken: info.pushToken ?? existing.pushToken,
          osVersion: (info.osVersion ?? existing.osVersion) as any,
        });
      return existing.id;
    }

    const id = uuidv4();
    await this.prisma.orm.public.UserDevice.create({
      id,
      userId,
      deviceToken: info.deviceToken as any,
      platform: (info.platform ?? 'unknown') as any,
      model: (info.deviceModel ?? null) as any,
      osVersion: (info.osVersion ?? null) as any,
      appVersion: (info.appVersion ?? null) as any,
      pushToken: info.pushToken ?? null,
      isBlocked: false,
    } as any);

    await this.emitSecurityEvent(userId, 'DEVICE_REGISTERED', info.ip, id, {}, 'LOW');
    return id;
  }

  private async checkBlockedIp(ip: string): Promise<void> {
    const blocked = await this.prisma.orm.public.BlockedIp
      .where({ ipAddress: ip as any })
      .first();

    if (!blocked) return;
    if (blocked.isPermanent) throw new ForbiddenException('Access denied');
    const blockExpiry = blocked.expiresAt?.epochMilliseconds ?? new Date(String(blocked.expiresAt)).getTime();
    if (blocked.expiresAt && Date.now() < blockExpiry) {
      throw new ForbiddenException('Access denied');
    }
  }

  private async emitSecurityEvent(
    userId: string,
    eventType: string,
    ip: string | null,
    deviceId: string | null,
    metadata: object,
    severity: string,
  ): Promise<void> {
    await this.prisma.orm.public.SecurityEvent.create({
      userId,
      eventType: eventType as any,
      ipAddress: ip as any,
      deviceId,
      metadata,
      severity: severity as any,
    } as any);
  }
}
