import {
  Get,
  Post,
  Body,
  Delete,
  Param,
  Controller,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { ServiceError } from '@common/error/service.error';
import { GlobalConfig } from '@entities/GlobalConfig';

import { GlobalService } from './global.service';
import { CreateGlobalConfigDto, UpdateGlobalConfigDto } from './dto';

// @ApiBearerAuth()
@ApiTags('global')
@Controller('global')
export class GlobalController {
  constructor(
    private readonly service: GlobalService,
  ) { }

  @Post()
  @ApiOperation({
    summary: '创建全局配置项',
    description: '按照指定的数据格式，创建全局配置项',
  })
  @ApiResponse({
    status: 200,
    description: '返回被被创建的数据',
    type: GlobalConfig,
  })
  @ApiBody({
    type: CreateGlobalConfigDto,
  })
  @UseInterceptors(ResponseInterceptor)
  async create(
    @Body() dto: CreateGlobalConfigDto,
  ): Promise<GlobalConfig | ServiceError> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: '获取全局配置列表',
    description: '返回全局配置数据列表',
  })
  @ApiResponse({
    status: 200,
    description: '返回全局数据列表',
    type: GlobalConfig,
    isArray: true,
  })
  @UseInterceptors(ResponseInterceptor)
  async findAll(): Promise<GlobalConfig[] | ServiceError> {
    return await this.service.findAll();
  }

  @Get(':name')
  @ApiOperation({
    summary: '获取全局配置列表',
    description: '返回全局配置数据列表',
  })
  @ApiResponse({
    status: 200,
    description: '返回查找到的数据',
    type: GlobalConfig,
  })
  @UseInterceptors(ResponseInterceptor)
  async findOne(
    @Param('name') name: string,
  ): Promise<GlobalConfig | ServiceError> {
    return await this.service.findOne(name);
  }

  @Delete(':name')
  @ApiOperation({
    summary: '删除全局配置项',
    description: '根据指定 name，对全局配置进行查询，对查询到的项进行删除',
  })
  @ApiResponse({
    status: 200,
    description: '返回被删除的数据',
    type: GlobalConfig,
  })
  @UseInterceptors(ResponseInterceptor)
  async delete(
    @Param('name') name: string,
  ): Promise<GlobalConfig | ServiceError> {
    return await this.service.delete(name);
  }

  @Patch(':name')
  @ApiOperation({
    summary: '更新全局配置项',
    description: '根据指定 name，对全局配置进行查询，对查询到的项进行更新',
  })
  @ApiResponse({
    status: 200,
    description: '返回已经更新的数据',
    type: GlobalConfig,
  })
  @ApiBody({
    type: UpdateGlobalConfigDto,
  })
  @UseInterceptors(ResponseInterceptor)
  async update(
    @Param('name') name: string,
    @Body() dto: UpdateGlobalConfigDto,
  ): Promise<GlobalConfig | ServiceError> {
    return await this.service.update(name, dto);
  }
}
