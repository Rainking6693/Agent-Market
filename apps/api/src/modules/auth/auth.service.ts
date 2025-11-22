import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';

import { PrismaService } from '../database/prisma.service.js';
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
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(data: RegisterUserDto) {
    const { email, password, displayName } = data;

    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    // Hash password and create user
    const passwordHash = await hash(password);
    const dbUser = await this.prisma.user.create({
      data: {
        email,
        displayName,
        password: passwordHash,
      },
    });

    const user = this.dbUserToAuthUser(dbUser);
    return this.buildAuthResponse(user);
  }

  async login(data: LoginDto) {
    const dbUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await verify(dbUser.password, data.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = this.dbUserToAuthUser(dbUser);
    return this.buildAuthResponse(user);
  }

  private dbUserToAuthUser(dbUser: { id: string; email: string; displayName: string }): AuthenticatedUser {
    return {
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.displayName,
      kind: 'user',
    };
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
