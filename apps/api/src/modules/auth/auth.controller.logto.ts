import { LogtoClient } from '@logto/node';
import { Controller, Get, Logger, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { LogtoAuthGuard } from './guards/logto-auth.guard.js';

/**
 * Logto authentication controller
 * Handles OAuth callbacks and user info endpoints
 */
@Controller('auth')
export class LogtoAuthController {
  private readonly logger = new Logger(LogtoAuthController.name);
  private logtoClient: LogtoClient | null = null;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('LOGTO_ENDPOINT');
    const appId = this.configService.get<string>('LOGTO_APP_ID');
    const appSecret = this.configService.get<string>('LOGTO_APP_SECRET');

    if (endpoint && appId && appSecret) {
      this.logtoClient = new LogtoClient({
        endpoint,
        appId,
        appSecret,
      });
    }
  }

  /**
   * OAuth callback endpoint
   * This is called by Logto after user authentication
   */
  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    if (!this.logtoClient) {
      this.logger.error('Logto is not configured');
      return res.status(500).json({ message: 'Logto is not configured' });
    }

    if (!code) {
      this.logger.error('No authorization code provided');
      return res.status(400).json({ message: 'No authorization code provided' });
    }

    try {
      // Exchange authorization code for access token
      const { accessToken, refreshToken } = await this.logtoClient.getAccessToken(code, {
        redirectUri: this.configService.get<string>('LOGTO_REDIRECT_URI') || '',
      });

      // Get user info
      const userInfo = await this.logtoClient.getUserInfo(accessToken);

      this.logger.log(`User authenticated: ${userInfo.sub}`);

      // Redirect to frontend with tokens (you may want to use a more secure method)
      const frontendUrl = this.configService.get<string>('WEB_URL', 'http://localhost:3000');
      const redirectUrl = new URL('/auth/callback', frontendUrl);
      redirectUrl.searchParams.set('access_token', accessToken);
      if (refreshToken) {
        redirectUrl.searchParams.set('refresh_token', refreshToken);
      }

      return res.redirect(redirectUrl.toString());
    } catch (error) {
      this.logger.error('OAuth callback failed', error);
      const frontendUrl = this.configService.get<string>('WEB_URL', 'http://localhost:3000');
      return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
  }

  /**
   * Get current user info
   * Protected endpoint that requires valid access token
   */
  @Get('me')
  @UseGuards(LogtoAuthGuard)
  async getMe(@Req() req: Request & { user: unknown }) {
    return {
      user: req.user,
    };
  }
}

