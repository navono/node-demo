import * as path from 'path';
import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
  Get,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Request } from 'express';
import { diskStorage } from 'multer';

import { hmiConfig } from '@util/config';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { ServiceError } from '@common/error/service.error';
import { Resource } from '@entities/Resource';

import { ResourceService } from './resource.service';
import { QueryResourcesDto, ImportResourceDto, UpdateResourceDto } from './dto';

// @ApiBearerAuth()
@ApiTags('resources')
@Controller('resources')
export class ResourceController {
  static storageFilename = (
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
  ) => {
    const parsedFilename = path.parse(file.originalname);
    callback(null, `${parsedFilename.name}${parsedFilename.ext}`);
  };

  constructor(
    private readonly service: ResourceService,
  ) { }

  @Post('upload')
  @ApiOperation({
    summary: '导入资源',
    description:
      '通过导入文件形式导入资源。body 中还有类型为 File 对象的 content 字段。',
  })
  @ApiResponse({
    status: 201,
    description: '返回导入的资源元数据',
    type: Resource,
  })
  @UseInterceptors(
    FileInterceptor('content', {
      storage: diskStorage({
        destination: hmiConfig.uploadResourceDir,
        filename: ResourceController.storageFilename,
      }),
    }),
  )
  @UseInterceptors(ResponseInterceptor)
  async import(
    @Body() dto: ImportResourceDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Resource | ServiceError> {
    return await this.service.import(dto, file);
  }

  @Get()
  @ApiOperation({
    summary: '查询资源',
    description: '通过指定查询字段，获取资源列表。',
  })
  @ApiResponse({
    status: 200,
    description: '返回查询到的资源元数据列表',
    type: Resource,
  })
  @UseInterceptors(ResponseInterceptor)
  async query(
    @Query() dto: QueryResourcesDto,
  ): Promise<Resource[] | ServiceError> {
    return await this.service.query(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: '通过 id 查询资源',
    description: '通过指定资源 id，查询资源。',
  })
  @ApiResponse({
    status: 200,
    description: '返回查询到的资源元数据',
    type: Resource,
  })
  @UseInterceptors(ResponseInterceptor)
  async queryById(@Param('id') id: string): Promise<Resource | ServiceError> {
    return await this.service.queryById(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除资源',
    description: '通过指定资源 id，删除资源。',
  })
  @ApiResponse({
    status: 200,
    description: '返回被删除的资源元数据',
    type: Resource,
  })
  @UseInterceptors(ResponseInterceptor)
  async delete(@Param('id') id: string): Promise<Resource | ServiceError> {
    return await this.service.deleteById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '更新资源信息',
    description: '通过指定资源 id，更新资源基本信息。',
  })
  @ApiResponse({
    status: 200,
    description: '返回被更新的资源元数据',
    type: Resource,
  })
  @UseInterceptors(ResponseInterceptor)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
  ): Promise<Resource | ServiceError> {
    return await this.service.update(id, dto);
  }
}
