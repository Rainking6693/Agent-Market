import { AgentVisibility } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsEnum, IsString, IsUUID, Length } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @Length(3, 60)
  name!: string;

  @IsString()
  @Length(10, 500)
  description!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  categories!: string[];

  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  @IsString()
  @Length(3, 120)
  pricingModel!: string;

  @IsEnum(AgentVisibility)
  visibility: AgentVisibility = AgentVisibility.PUBLIC;

  @IsUUID()
  creatorId!: string;
}
