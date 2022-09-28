import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImportResourceDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly id: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ default: '""' })
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly category: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ default: '""' })
  readonly description: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ default: false })
  readonly preset: boolean;
}
