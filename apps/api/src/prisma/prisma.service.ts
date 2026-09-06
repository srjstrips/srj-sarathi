import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { db } from './db.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  readonly orm = db.orm;
  readonly sql = db.sql;

  async onModuleInit() {
    this.logger.log('Database client ready');
  }

  async onModuleDestroy() {
    await db.close();
    this.logger.log('Database disconnected');
  }
}
