import { Type } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class NegotiationRequirementsDto {
  [key: string]: unknown;
}

export class NegotiationRequestDto {
  @IsUUID()
  requesterAgentId!: string;

  @IsUUID()
  responderAgentId!: string;

  @IsString()
  requestedService!: string;

  @IsNumber()
  @IsPositive()
  budget!: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NegotiationRequirementsDto)
  requirements?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;
}

