import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly id: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly name: string;

  // @ApiProperty()
  // @IsString()
  // readonly email: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly bio: string;
}
