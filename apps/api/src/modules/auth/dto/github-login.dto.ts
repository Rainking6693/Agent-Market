import { IsNotEmpty, IsString } from 'class-validator';

export class GitHubLoginDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

