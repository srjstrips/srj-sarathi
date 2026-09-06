import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { ImportController } from './import.controller.js';
import { ImportService } from './import.service.js';
import { ImportProcessor, IMPORT_QUEUE } from './import.processor.js';

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
    BullModule.registerQueue({ name: IMPORT_QUEUE }),
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [ImportService],
})
export class ImportModule {}
