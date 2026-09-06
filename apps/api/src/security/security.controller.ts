import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { SecurityService } from './security.service.js';
import { BlockIpDto } from './dto/block-ip.dto.js';
import { BlockUserDto } from './dto/block-user.dto.js';
import { SecurityEventsQueryDto } from './dto/security-events-query.dto.js';

@ApiTags('Security')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  // ─── Dashboard ────────────────────────────────────────────────────────────

  @Get('dashboard')
  @RequirePermissions('security.dashboard.view')
  getDashboard(): Promise<any> {
    return this.securityService.getDashboard();
  }

  // ─── Security Events ──────────────────────────────────────────────────────

  @Get('events')
  @RequirePermissions('security.events.view')
  getEvents(@Query() query: SecurityEventsQueryDto) {
    return this.securityService.getSecurityEvents(query);
  }

  @Get('events/:id')
  @RequirePermissions('security.events.view')
  getEvent(@Param('id') id: string) {
    return this.securityService.getSecurityEvent(id);
  }

  // ─── Login Attempts ───────────────────────────────────────────────────────

  @Get('login-attempts')
  @RequirePermissions('security.audit.view')
  getLoginAttempts(
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.securityService.getLoginAttempts(
      userId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('users/:userId/login-history')
  @RequirePermissions('security.audit.view')
  getLoginHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.securityService.getLoginHistory(
      userId,
      limit ? parseInt(limit, 10) : 30,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  // ─── IP Blocking ──────────────────────────────────────────────────────────

  @Get('blocked-ips')
  @RequirePermissions('security.ip.view')
  getBlockedIps() {
    return this.securityService.getBlockedIps();
  }

  @Post('blocked-ips')
  @RequirePermissions('security.ip.block')
  blockIp(@Body() dto: BlockIpDto, @CurrentUser() user: { id: string }) {
    return this.securityService.blockIp(dto, user.id);
  }

  @Delete('blocked-ips/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('security.ip.block')
  unblockIp(@Param('id') id: string) {
    return this.securityService.unblockIp(id);
  }

  // ─── User Blocking ────────────────────────────────────────────────────────

  @Get('blocked-users')
  @RequirePermissions('security.users.block')
  getBlockedUsers() {
    return this.securityService.getBlockedUsers();
  }

  @Post('users/:userId/block')
  @RequirePermissions('security.users.block')
  blockUser(
    @Param('userId') userId: string,
    @Body() dto: BlockUserDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.securityService.blockUser(userId, dto, user.id);
  }

  @Patch('users/:userId/unblock')
  @RequirePermissions('security.users.block')
  unblockUser(
    @Param('userId') userId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.securityService.unblockUser(userId, user.id);
  }

  // ─── Devices ──────────────────────────────────────────────────────────────

  @Get('devices')
  @RequirePermissions('security.devices.view')
  getAllDevices(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.securityService.getAllDevices(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('users/:userId/devices')
  @RequirePermissions('security.devices.view')
  getUserDevices(@Param('userId') userId: string) {
    return this.securityService.getUserDevices(userId);
  }

  @Delete('users/:userId/devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('security.devices.view')
  revokeDevice(
    @Param('userId') userId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.securityService.revokeDevice(deviceId, userId);
  }

  // ─── Sessions ─────────────────────────────────────────────────────────────

  @Get('sessions')
  @RequirePermissions('security.sessions.view')
  getActiveSessions(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.securityService.getActiveSessions(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('security.sessions.revoke')
  forceRevokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.securityService.forceRevokeSession(sessionId, user.id);
  }

  // ─── Audit log ────────────────────────────────────────────────────────────

  @Get('audit')
  @RequirePermissions('security:audit:read')
  getAuditLog(
    @Query('userId')     userId?: string,
    @Query('action')     action?: string,
    @Query('resource')   resource?: string,
    @Query('limit',  new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0),  ParseIntPipe) offset?: number,
  ) {
    return this.securityService.getAuditLog({ userId, action, resource }, limit, offset);
  }
}
