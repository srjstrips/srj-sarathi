import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody, ConnectedSocket,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatPresenceService } from './services/presence.service.js';
import { ChatMessageService } from './services/message.service.js';
import { ChatConversationService } from './services/conversation.service.js';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private socketUserMap = new Map<string, string>(); // socketId → userId

  constructor(
    private readonly jwt:       JwtService,
    private readonly presence:  ChatPresenceService,
    private readonly messages:  ChatMessageService,
    private readonly convs:     ChatConversationService,
  ) {}

  // ─── Connection lifecycle ─────────────────────────────────────────────────

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token as string;
      if (!token) { socket.disconnect(); return; }
      const payload = this.jwt.verify<{ sub: string }>(token);
      const userId  = payload.sub;
      this.socketUserMap.set(socket.id, userId);

      await this.presence.setOnline(userId);
      socket.join(`user:${userId}`);

      // Join all conversation rooms
      const memberships = await (this.convs as any).prisma.orm.public.ChatConversationMember
        .where({ userId, leftAt: null }).all();
      for (const m of memberships as any[]) {
        socket.join(`conv:${m.conversationId}`);
      }

      this.server.to(`user:${userId}`).emit('connected', { userId });
    } catch {
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = this.socketUserMap.get(socket.id);
    if (userId) {
      this.socketUserMap.delete(socket.id);
      await this.presence.setOffline(userId);
      this.server.emit('presence:offline', { userId, lastSeen: Date.now() });
    }
  }

  // ─── Heartbeat ────────────────────────────────────────────────────────────

  @SubscribeMessage('heartbeat')
  async onHeartbeat(@ConnectedSocket() socket: Socket) {
    const userId = this.socketUserMap.get(socket.id);
    if (userId) await this.presence.heartbeat(userId);
  }

  // ─── Typing ───────────────────────────────────────────────────────────────

  @SubscribeMessage('typing:start')
  async onTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId || !data.conversationId) return;
    await this.presence.setTyping(data.conversationId, userId);
    socket.to(`conv:${data.conversationId}`).emit('typing:start', { userId, conversationId: data.conversationId });
  }

  @SubscribeMessage('typing:stop')
  async onTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId || !data.conversationId) return;
    await this.presence.clearTyping(data.conversationId, userId);
    socket.to(`conv:${data.conversationId}`).emit('typing:stop', { userId, conversationId: data.conversationId });
  }

  // ─── Message delivery ack ─────────────────────────────────────────────────

  @SubscribeMessage('message:delivered')
  async onDelivered(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { messageId: string; conversationId: string },
  ) {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId) return;
    socket.to(`conv:${data.conversationId}`).emit('message:delivered', {
      messageId: data.messageId, userId,
    });
  }

  // ─── WebRTC call signaling (media never passes through here) ─────────────

  @SubscribeMessage('call:offer')
  onCallOffer(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId || !data.recipientId) return;
    this.server.to(`user:${data.recipientId}`).emit('call:offer', { ...data, callerId: userId });
  }

  @SubscribeMessage('call:answer')
  onCallAnswer(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId || !data.callerId) return;
    this.server.to(`user:${data.callerId}`).emit('call:answer', { ...data, answererId: userId });
  }

  @SubscribeMessage('call:ice-candidate')
  onIceCandidate(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId || !data.recipientId) return;
    this.server.to(`user:${data.recipientId}`).emit('call:ice-candidate', { ...data, senderId: userId });
  }

  @SubscribeMessage('call:end')
  onCallEnd(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId || !data.recipientId) return;
    this.server.to(`user:${data.recipientId}`).emit('call:end', { senderId: userId });
  }

  @SubscribeMessage('call:reject')
  onCallReject(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
    const userId = this.socketUserMap.get(socket.id);
    if (!userId || !data.callerId) return;
    this.server.to(`user:${data.callerId}`).emit('call:reject', { rejecterId: userId });
  }

  // ─── Emit helpers (called from REST services) ────────────────────────────

  broadcastNewMessage(conversationId: string, message: any) {
    this.server.to(`conv:${conversationId}`).emit('message:new', message);
  }

  broadcastMessageEdited(conversationId: string, message: any) {
    this.server.to(`conv:${conversationId}`).emit('message:edited', message);
  }

  broadcastMessageDeleted(conversationId: string, messageId: string) {
    this.server.to(`conv:${conversationId}`).emit('message:deleted', { messageId, conversationId });
  }

  broadcastReaction(conversationId: string, reaction: any) {
    this.server.to(`conv:${conversationId}`).emit('message:reaction', reaction);
  }

  broadcastGroupUpdate(conversationId: string, event: string, payload: any) {
    this.server.to(`conv:${conversationId}`).emit(`group:${event}`, payload);
  }

  addSocketToRoom(userId: string, conversationId: string) {
    this.server.in(`user:${userId}`).socketsJoin(`conv:${conversationId}`);
  }

  removeSocketFromRoom(userId: string, conversationId: string) {
    this.server.in(`user:${userId}`).socketsLeave(`conv:${conversationId}`);
  }
}
