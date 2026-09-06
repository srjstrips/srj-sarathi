import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface JwtPayload {
  sub: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('jwt.accessSecret')!,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const session = await this.prisma.orm.public.UserSession
      .where({ id: payload.sessionId, status: 'ACTIVE' })
      .first();

    if (!session) throw new UnauthorizedException('Session expired or revoked');

    const user = await this.prisma.orm.public.User
      .where({ id: payload.sub })
      .first();

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Update last activity (fire-and-forget)
    this.prisma.orm.public.UserSession
      .where({ id: payload.sessionId })
      .update({ lastActivityAt: new Date() })
      .catch(() => {});

    return { id: user.id, username: user.username, sessionId: payload.sessionId };
  }
}
