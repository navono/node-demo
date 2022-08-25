import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGlobalConfigDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly value: string;
}
