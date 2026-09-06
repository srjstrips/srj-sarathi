import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { ExportController } from './export.controller.js';
import { ExportService } from './export.service.js';
import { ExportProcessor, EXPORT_QUEUE } from './export.processor.js';

@Module({
  imports: [
    AuthenticationModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host:     config.get<string>('redis.host', 'localhost'),
          port:     config.get<number>('redis.port', 6379),
          password: config.get<string | undefined>('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: EXPORT_QUEUE }),
  ],
  controllers: [ExportController],
  providers: [ExportService, ExportProcessor, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [ExportService],
})
export class ExportModule {}
