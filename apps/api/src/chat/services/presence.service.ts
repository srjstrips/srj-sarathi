import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

const PRESENCE_TTL   = 60;   // seconds
const TYPING_TTL     = 5;    // seconds

@Injectable()
export class ChatPresenceService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  // ─── Presence ─────────────────────────────────────────────────────────────

  async setOnline(userId: string) {
    await this.redis.set(`presence:${userId}`, 'online', 'EX', PRESENCE_TTL);
  }

  async setOffline(userId: string) {
    await this.redis.del(`presence:${userId}`);
    await this.redis.set(`last_seen:${userId}`, Date.now().toString());
  }

  async heartbeat(userId: string) {
    await this.redis.set(`presence:${userId}`, 'online', 'EX', PRESENCE_TTL);
  }

  async isOnline(userId: string): Promise<boolean> {
    return !!(await this.redis.get(`presence:${userId}`));
  }

  async getBulkPresence(userIds: string[]): Promise<Record<string, { online: boolean; lastSeen?: number }>> {
    const result: Record<string, { online: boolean; lastSeen?: number }> = {};
    for (const id of userIds) {
      const online = await this.isOnline(id);
      result[id] = { online };
      if (!online) {
        const raw = await this.redis.get(`last_seen:${id}`);
        if (raw) result[id].lastSeen = parseInt(raw, 10);
      }
    }
    return result;
  }

  // ─── Typing indicators (never persisted to DB) ────────────────────────────

  async setTyping(conversationId: string, userId: string) {
    const key = `typing:${conversationId}:${userId}`;
    await this.redis.set(key, '1', 'EX', TYPING_TTL);
  }

  async clearTyping(conversationId: string, userId: string) {
    await this.redis.del(`typing:${conversationId}:${userId}`);
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    const keys = await this.redis.keys(`typing:${conversationId}:*`);
    return keys.map(k => k.split(':')[2]);
  }
}
