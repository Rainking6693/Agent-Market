import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { GitHubLoginDto } from './dto/github-login.dto.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterUserDto } from './dto/register-user.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterUserDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('google')
  google(@Body() body: GoogleLoginDto) {
    return this.authService.loginWithGoogle(body);
  }

  @Post('github')
  github(@Body() body: GitHubLoginDto) {
    return this.authService.loginWithGitHub(body);
  }
}
