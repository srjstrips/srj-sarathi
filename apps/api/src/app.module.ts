import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthenticationModule } from './authentication/authentication.module.js';
import { AuthorizationModule } from './authorization/authorization.module.js';
import { SecurityModule } from './security/security.module.js';
import { PrivacyModule } from './privacy/privacy.module.js';
import { OrgModule } from './org/org.module.js';
import { EmployeeModule } from './employee/employee.module.js';
import { ImportModule } from './import/import.module.js';
import { ExportModule } from './export/export.module.js';
import { TaskModule } from './task/task.module.js';
import { KaizenModule } from './kaizen/kaizen.module.js';
import { ChatModule } from './chat/chat.module.js';
import { AuditInterceptor } from './common/interceptors/audit.interceptor.js';
import configuration from './config/configuration.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthenticationModule,
    AuthorizationModule,
    SecurityModule,
    PrivacyModule,
    OrgModule,
    EmployeeModule,
    ImportModule,
    ExportModule,
    TaskModule,
    KaizenModule,
    ChatModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
