import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { NotificationsService } from './notifications.service.js';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.notificationsService.listForUser(user.sub, status);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markRead(id, user.sub);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllRead(user.sub);
  }

  @Get('preferences')
  getPreferences(@CurrentUser() user: any) {
    return this.notificationsService.getPreferences(user.sub);
  }

  @Patch('preferences')
  updatePreferences(@CurrentUser() user: any, @Body() updates: Record<string, boolean>) {
    return this.notificationsService.updatePreferences(user.sub, updates);
  }

  @Post('push-token')
  registerPushToken(
    @CurrentUser() user: any,
    @Body('token') token: string,
    @Body('platform') platform: string,
  ) {
    return this.notificationsService.registerPushToken(user.sub, token, platform);
  }
}
