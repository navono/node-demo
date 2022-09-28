import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly name: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly category: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly description: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly content: string;
}
