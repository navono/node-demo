import {
  // Logger,
  Get,
  Post,
  Body,
  Controller,
  UsePipes,
  Patch,
  Delete,
  Param,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { User } from '@entities/User';
import { ValidationPipe } from '@common/pipes/validation.pipe';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { ServiceError } from '@common/error/service.error';

import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { QueryUsersDto } from './dto/query-user.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    // private readonly logger: Logger,
  ) { }

  @Post('user')
  @ApiOperation({
    summary: '创建用户',
    description: '按照指定的数据格式，创建一个新用户',
  })
  @UseInterceptors(ResponseInterceptor)
  @UsePipes(new ValidationPipe())
  @ApiBody({
    type: CreateUserDto,
  })
  async create(@Body() dto: CreateUserDto): Promise<User | ServiceError> {
    return this.userService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: '查询用户',
    description: '按照指定的查询格式，查询满足条件的用户列表',
  })
  @UseInterceptors(ResponseInterceptor)
  async query(@Query() dto: QueryUsersDto): Promise<User[] | ServiceError> {
    return this.userService.query(dto);
  }

  @Patch('/update')
  @ApiOperation({
    summary: '更新用户',
    description: '根据指定 id ，对查询到的用户进行数据更新',
  })
  @UseInterceptors(ResponseInterceptor)
  @ApiBody({
    type: UpdateUserDto,
  })
  async update(@Body() dto: UpdateUserDto): Promise<User | ServiceError> {
    return await this.userService.update(dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除用户',
    description: '根据指定 id ，对查询到的用户进行删除',
  })
  @UseInterceptors(ResponseInterceptor)
  async delete(@Param('id') id: string): Promise<User | ServiceError> {
    return await this.userService.delete(id);
  }
}
