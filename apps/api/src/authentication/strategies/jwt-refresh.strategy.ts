import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface RefreshPayload {
  sub: string;
  sessionId: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.get<string>('jwt.refreshSecret')!,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(_req: Request, payload: RefreshPayload) {
    if (!payload.sub || !payload.sessionId) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return { id: payload.sub, sessionId: payload.sessionId };
  }
}
