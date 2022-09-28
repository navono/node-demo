import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly password: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly id?: string;

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty()
  // readonly email: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly bio?: string;
}
