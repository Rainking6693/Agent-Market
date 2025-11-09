import { IsJSON, IsNumber, IsOptional, IsPositive, IsUUID, MaxLength } from 'class-validator';

export class ExecuteAgentDto {
  @IsUUID()
  initiatorId!: string;

  @IsOptional()
  @IsJSON()
  input: string = '{}';

  @IsOptional()
  @MaxLength(200)
  jobReference?: string;

  @IsOptional()
  @IsPositive()
  @IsNumber()
  budget?: number;
}
