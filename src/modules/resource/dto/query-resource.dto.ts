import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryResourcesDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly queryKey: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly category: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: '分页号，从 0 开始',
  })
  readonly pageNo: number;

  @IsOptional()
  @ApiPropertyOptional({
    description: '每页位号个数',
  })
  readonly pageSize: number;
}
