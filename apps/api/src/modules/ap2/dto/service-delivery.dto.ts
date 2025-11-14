import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

class DeliveryPayloadDto {
  [key: string]: unknown;
}

export class ServiceDeliveryDto {
  @IsUUID()
  negotiationId!: string;

  @IsUUID()
  responderAgentId!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryPayloadDto)
  result!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryPayloadDto)
  evidence?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;
}

