import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service.js';

const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

// Routes whose response may contain private data — never log their body
const SENSITIVE_PATHS = [
  '/auth/login', '/auth/refresh', '/auth/change-password',
  '/bank-detail', '/emergency-contacts',
];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<any>();

    if (!MUTATING.has(req.method)) return next.handle();

    const user      = req.user as any;
    const userId    = user?.id ?? null;
    const ipAddress = (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket?.remoteAddress ??
      null
    );

    const url: string = req.url ?? '';
    const isSensitive = SENSITIVE_PATHS.some(p => url.includes(p));

    const parts = url.replace(/\?.*$/, '').split('/').filter(Boolean);
    // resource = first non-version segment e.g. "employees", "org", "import"
    const versionIdx = parts.findIndex(p => /^v\d/.test(p));
    const resource   = parts[versionIdx + 1] ?? parts[0] ?? 'unknown';
    const resourceId = parts[versionIdx + 2] ?? null;

    return next.handle().pipe(
      tap({
        next: () => {
          // fire-and-forget — don't block the response
          this.prisma.orm.public.AuditLog.create({
            userId,
            action:     req.method,
            resource,
            resourceId: isSensitive ? null : (resourceId ?? null),
            metadata:   isSensitive ? null : { url, body: req.body ?? null },
            ipAddress:  ipAddress as any,
          } as any).catch(() => { /* swallow audit errors */ });
        },
        error: (err) => {
          this.prisma.orm.public.AuditLog.create({
            userId,
            action:     `${req.method}_FAILED`,
            resource,
            resourceId: null,
            metadata:   { url, error: err?.message ?? 'unknown' },
            ipAddress:  ipAddress as any,
          } as any).catch(() => {});
        },
      }),
    );
  }
}
