import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUsersDto {
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
