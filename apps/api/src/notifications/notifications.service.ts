import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string, status?: string) {
    const where: Record<string, unknown> = { userId };
    if (status) where['status'] = status;
    return this.prisma.orm.public.Notification
      .where(where as any)
      .orderBy(m => (m as any).sentAt.desc())
      .take(50)
      .all();
  }

  async markRead(id: string, userId: string) {
    const notif = await this.prisma.orm.public.Notification.where({ id, userId } as any).first();
    if (!notif) throw new NotFoundException('Notification not found');
    await this.prisma.orm.public.Notification
      .where({ id } as any)
      .update({ status: 'READ' as any, readAt: now() as any } as any);
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.orm.public.Notification
      .where({ userId, status: 'UNREAD' } as any)
      .update({ status: 'READ' as any, readAt: now() as any } as any);
    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = Number(
      await this.prisma.orm.public.Notification.where({ userId, status: 'UNREAD' } as any).count(),
    );
    return { count };
  }

  async send(userId: string, payload: {
    title: string;
    body?: string;
    type: string;
    resourceType?: string;
    resourceId?: string;
    deepLink?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.orm.public.Notification.create({
      id:           uuidv4(),
      userId,
      title:        payload.title as any,
      body:         payload.body ?? null,
      type:         payload.type as any,
      resourceType: payload.resourceType ?? null,
      resourceId:   payload.resourceId   ?? null,
      deepLink:     payload.deepLink     ?? null,
      status:       'UNREAD' as any,
      metadata:     payload.metadata ?? null,
      sentAt:       now() as any,
    } as any);
  }

  async getPreferences(userId: string) {
    let prefs = await this.prisma.orm.public.NotificationPreference.where({ userId } as any).first();
    if (!prefs) {
      prefs = await this.prisma.orm.public.NotificationPreference.create({
        id:                 uuidv4(),
        userId,
        emailEnabled:       true,
        pushEnabled:        true,
        taskAssigned:       true,
        leaveUpdates:       true,
        kraReminders:       true,
        kaizenUpdates:      false,
        announcementAlerts: true,
        createdAt:          now() as any,
        updatedAt:          now() as any,
      } as any);
    }
    return prefs;
  }

  async updatePreferences(userId: string, updates: Record<string, boolean>) {
    const prefs = await this.getPreferences(userId);
    await this.prisma.orm.public.NotificationPreference
      .where({ userId } as any)
      .update({ ...updates, updatedAt: now() as any } as any);
    return this.prisma.orm.public.NotificationPreference.where({ userId } as any).first();
  }

  async registerPushToken(userId: string, token: string, platform: string) {
    const existing = await this.prisma.orm.public.PushToken.where({ token } as any).first();
    if (existing) {
      await this.prisma.orm.public.PushToken
        .where({ token } as any)
        .update({ userId, isActive: true, updatedAt: now() as any } as any);
      return existing;
    }
    return this.prisma.orm.public.PushToken.create({
      id:        uuidv4(),
      userId,
      token:     token as any,
      platform:  platform as any,
      isActive:  true,
      createdAt: now() as any,
      updatedAt: now() as any,
    } as any);
  }
}
