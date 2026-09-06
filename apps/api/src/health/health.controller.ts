import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  private async dbPing(): Promise<HealthIndicatorResult> {
    try {
      await (this.prisma.orm as any).user.findFirst({ select: { id: true } });
      return { database: { status: 'up' } };
    } catch {
      return { database: { status: 'down' } };
    }
  }

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([() => this.dbPing()]);
  }

  @Get('health/live')
  live() {
    return { status: 'ok' };
  }

  @Get('health/ready')
  @HealthCheck()
  ready() {
    return this.health.check([() => this.dbPing()]);
  }

  @Get('version')
  version() {
    return {
      version: process.env.npm_package_version ?? '1.0.0',
      env: process.env.NODE_ENV ?? 'development',
    };
  }
}
