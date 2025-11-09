import { randomUUID } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';

import { LoginDto } from './dto/login.dto.js';
import { RegisterUserDto } from './dto/register-user.dto.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
}

@Injectable()
export class AuthService {
  private readonly users = new Map<string, { user: AuthenticatedUser; passwordHash: string }>();

  constructor(private readonly jwtService: JwtService) {}

  async register(data: RegisterUserDto) {
    const { email, password, displayName } = data;

    if (this.users.has(email)) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await hash(password);
    const user = {
      id: randomUUID(),
      email,
      displayName,
    };

    this.users.set(email, { user, passwordHash });
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

  private buildAuthResponse(user: AuthenticatedUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
      expiresIn: 3600,
    };
  }
}
