import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

interface AuthUser {
  id: string;
  sessionId: string;
  username: string;
}

function getIp(req: any): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.socket?.remoteAddress ??
    'unknown'
  );
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with username and password' })
  login(@Body() dto: LoginDto, @Req() req: any): Promise<any> {
    return this.authService.login(dto, getIp(req), req.headers['user-agent'] ?? '');
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  logout(@CurrentUser() user: AuthUser, @Req() req: any): Promise<any> {
    return this.authService.logout(user.id, user.sessionId, getIp(req));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Rotate access + refresh tokens' })
  refresh(@CurrentUser() user: AuthUser, @Req() req: any): Promise<any> {
    return this.authService.refresh(user.id, user.sessionId, getIp(req), req.headers['user-agent'] ?? '');
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: AuthUser): Promise<any> {
    return this.authService.getMe(user.id);
  }

  @Get('sessions')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  sessions(@CurrentUser() user: AuthUser): Promise<any> {
    return this.authService.getSessions(user.id);
  }

  @Post('sessions/:id/revoke')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  revokeSession(
    @CurrentUser() user: AuthUser,
    @Param('id') sessionId: string,
    @Req() req: any,
  ): Promise<any> {
    return this.authService.revokeSession(user.id, sessionId, getIp(req));
  }

  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  revokeAll(@CurrentUser() user: AuthUser, @Req() req: any): Promise<any> {
    return this.authService.revokeAllSessions(user.id, user.sessionId, getIp(req));
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: any,
  ): Promise<any> {
    return this.authService.changePassword(user.id, dto, getIp(req));
  }
}
