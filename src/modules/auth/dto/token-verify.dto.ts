import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenVerifyDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly token: string;
}
