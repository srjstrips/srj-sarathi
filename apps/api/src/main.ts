import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Security
  app.use(helmet());

  // CORS
  const rawOrigins = process.env.CORS_ORIGINS ?? 'http://localhost:8081';
  const origin = rawOrigins.trim() === '*' ? true : rawOrigins.split(',').map(o => o.trim());
  app.enableCors({ origin, credentials: true });

  // Global prefix
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'health/live', 'health/ready', 'version'] });

  // Global pipes, filters, interceptors
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor());

  // Swagger (non-production only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Sarthi HRMS API')
      .setDescription('SRJ Steel Sarthi HRMS REST API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger docs available at /docs');
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`API running on port ${port}`);
}
await bootstrap();
