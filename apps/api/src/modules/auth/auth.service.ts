import { randomUUID } from 'node:crypto';

import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import { OAuth2Client } from 'google-auth-library';

import { GitHubLoginDto } from './dto/github-login.dto.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterUserDto } from './dto/register-user.dto.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  kind?: 'user' | 'service_account';
  serviceAccountId?: string;
  organizationId?: string;
  agentId?: string;
  scopes?: string[];
}

@Injectable()
export class AuthService {
  private readonly users = new Map<string, { user: AuthenticatedUser; passwordHash: string }>();

  private readonly googleClientId?: string;
  private oauthClient?: OAuth2Client;

  constructor(
    private readonly jwtService: JwtService,
    @Optional() private readonly configService?: ConfigService,
  ) {
    this.googleClientId =
      this.configService?.get<string>('GOOGLE_OAUTH_CLIENT_ID') ??
      process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (this.googleClientId) {
      this.oauthClient = new OAuth2Client(this.googleClientId);
    }
  }

  async register(data: RegisterUserDto) {
    const { email, password, displayName } = data;

    if (this.users.has(email)) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await hash(password);
    const user = this.createUserRecord(email, displayName, passwordHash);
    return this.buildAuthResponse(user);
  }

  async login(data: LoginDto) {
    const existing = this.users.get(data.email);

    if (!existing) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await verify(existing.passwordHash, data.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(existing.user);
  }

  async loginWithGoogle(data: GoogleLoginDto) {
    if (!this.oauthClient || !this.googleClientId) {
      throw new UnauthorizedException('Google login is not configured');
    }

    const payload = await this.validateGoogleToken(data.token);
    const email = payload.email;
    if (!email) {
      throw new UnauthorizedException('Google token missing email');
    }

    const displayName = payload.name || email.split('@')[0];
    const user = this.ensureUser(email, displayName);

    return this.buildAuthResponse(user);
  }

  async loginWithGitHub(data: GitHubLoginDto) {
    const githubToken = data.token;
    if (!githubToken) {
      throw new UnauthorizedException('GitHub token is required');
    }

    // Validate GitHub token and get user info
    const userInfo = await this.validateGitHubToken(githubToken);
    const email = userInfo.email;
    if (!email) {
      throw new UnauthorizedException('GitHub token missing email');
    }

    const displayName = userInfo.name || userInfo.login || email.split('@')[0];
    const user = this.ensureUser(email, displayName);

    return this.buildAuthResponse(user);
  }

  private async validateGitHubToken(token: string) {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Invalid GitHub token');
      }

      const userData = (await response.json()) as {
        email: string | null;
        name: string | null;
        login: string;
      };

      // If email is private, try to get it from the emails endpoint
      if (!userData.email) {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (emailsResponse.ok) {
          const emails = (await emailsResponse.json()) as Array<{
            email: string;
            primary: boolean;
            verified: boolean;
          }>;
          const primaryEmail = emails.find((e) => e.primary && e.verified);
          if (primaryEmail) {
            userData.email = primaryEmail.email;
          }
        }
      }

      if (!userData.email) {
        throw new UnauthorizedException('GitHub account email is required');
      }

      return userData;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to validate GitHub token');
    }
  }

  private async validateGoogleToken(token: string) {
    if (!this.oauthClient || !this.googleClientId) {
      throw new UnauthorizedException('Google login is not configured');
    }

    // Support both ID tokens and OAuth access tokens.
    let payload = null;
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience: this.googleClientId,
      });
      payload = ticket.getPayload();
    } catch (err) {
      const tokenInfo = await this.oauthClient.getTokenInfo(token);
      payload = {
        email: tokenInfo.email,
        name: tokenInfo.email,
      };
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return payload;
  }

  private ensureUser(email: string, displayName: string) {
    const existing = this.users.get(email);
    if (existing) {
      return existing.user;
    }
    return this.createUserRecord(email, displayName, '');
  }

  private createUserRecord(email: string, displayName: string, passwordHash: string) {
    const user: AuthenticatedUser = {
      id: randomUUID(),
      email,
      displayName,
      kind: 'user',
    };
    this.users.set(email, { user, passwordHash });
    return user;
  }

  private buildAuthResponse(user: AuthenticatedUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
      kind: user.kind ?? 'user',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
      expiresIn: 3600,
    };
  }
}
