import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { ServiceError } from '@common/error/service.error';
import { User } from '@entities/User';

import { LoginDto, TokenVerifyDto } from './dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: '登录',
    description: '使用用户名密码登录当前服务',
  })
  @ApiResponse({
    status: 200,
    description: '返回 Token',
    type: String,
  })
  @ApiBody({
    type: LoginDto,
  })
  @UseInterceptors(ResponseInterceptor)
  async login(@Body() dto: LoginDto): Promise<string | ServiceError> {
    return this.service.login(dto);
  }

  @Post('verify')
  @ApiOperation({
    summary: '校验 token',
    description: '对分配给已登录的用户的 token 进行校验',
  })
  @ApiBody({
    type: TokenVerifyDto,
  })
  @ApiResponse({
    status: 200,
    description: '返回校验通过的用户信息',
    type: User,
  })
  @UseInterceptors(ResponseInterceptor)
  async tokenVerify(
    @Body() body: TokenVerifyDto,
  ): Promise<
    | Omit<User, 'password' | 'createAt' | 'updateAt'>
    | ServiceError
    | ServiceError
  > {
    return this.service.tokenVerify(body);
  }

  // @Post('refresh')
  // @UseGuards(JwtAuthGuard)
  // private refresh(@Req() { user }: Request): Promise<string | never> {
  //   return this.service.refresh(<User>user);
  // }
}
