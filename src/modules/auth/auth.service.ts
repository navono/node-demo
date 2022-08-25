import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SECRET } from '@util/constant';
import { User } from '@entities/User';
import { ServiceError } from '@common/error/service.error';
import { UserService } from '@modules/user/user.service';

import { LoginDto, TokenVerifyDto } from './dto';
import { ServiceStatus } from '@common/error/code.error';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
    private readonly logger: Logger,
  ) {}

  async login(dto: LoginDto): Promise<string | ServiceError> {
    const { username, password } = dto;

    try {
      const user = await this.userService.findByName(username);
      if (!user) {
        const msg = 'Input data validation failed. User not exist.';
        this.logger.error(`${msg}, username: ${username}`);
        throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      }

      const isPasswordValid = await this.userService.isPasswordValid(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        const msg = 'Input data validation failed. Password invalid.';
        this.logger.error(`${msg}, username: ${username}`);
        throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      }

      // this.repository.update(user.id, { lastLoginAt: new Date() });
      return this.generateToken(user);
    } catch (error) {
      const msg = 'Login failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.AUTH_LOGIN_FAILED,
        msg,
      });
    }
  }

  async tokenVerify(
    dto: TokenVerifyDto,
  ): Promise<Omit<User, 'password' | 'createAt' | 'updateAt'> | ServiceError> {
    try {
      const jwtData = await this.jwt.verifyAsync(dto.token, { secret: SECRET });
      const user = await this.userService.findByName(jwtData.username);
      if (!user) {
        const msg = 'Input data validation failed. User not found.';
        this.logger.error(`${msg} error`);
        throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      }

      return {
        name: user.name,
        id: user.id,
        bio: user.bio,
      };
    } catch (error) {
      const msg = 'Verify token failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.AUTH_TOKEN_INVALID,
        msg,
      });
    }
  }

  private generateToken(user: User): string {
    return this.jwt.sign(
      { id: user.id, username: user.name },
      { secret: SECRET },
    );
  }
}
