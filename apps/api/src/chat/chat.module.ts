import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ConfigModule }             from '@nestjs/config';
import { AuthenticationModule }    from '../authentication/authentication.module.js';
import { AuthorizationService }    from '../authorization/authorization.service.js';
import { AccessTokenGuard }        from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard }        from '../authorization/guards/permissions.guard.js';
import { PrismaModule }            from '../prisma/prisma.module.js';
import { ChatConversationService } from './services/conversation.service.js';
import { ChatMessageService }      from './services/message.service.js';
import { ChatPresenceService }     from './services/presence.service.js';
import { ChatPollService }         from './services/poll.service.js';
import { ChatModerationService }   from './services/moderation.service.js';
import { ChatGateway }             from './chat.gateway.js';
import {
  ChatConversationController,
  ChatMessageController,
  ChatMiscController,
  ChatPollController,
  ChatPresenceController,
} from './chat.controller.js';

@Module({
  imports: [
    ConfigModule,
    AuthenticationModule,
    PrismaModule,
    JwtModule.register({}),
  ],
  controllers: [
    ChatConversationController,
    ChatMessageController,
    ChatMiscController,
    ChatPollController,
    ChatPresenceController,
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
          password: config.get<string>('redis.password'),
        }),
    },
    ChatConversationService,
    ChatMessageService,
    ChatPresenceService,
    ChatPollService,
    ChatModerationService,
    ChatGateway,
    AuthorizationService,
    AccessTokenGuard,
    PermissionsGuard,
  ],
  exports: [
    ChatConversationService,
    ChatMessageService,
    ChatPresenceService,
    ChatGateway,
  ],
})
export class ChatModule {}
