import { v4 } from 'uuid';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { HttpStatus } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@entities/User';
import { ServiceStatus } from '@common/error/code.error';
import { ServiceError } from '@common/error/service.error';

import { QueryUsersDto } from './dto/query-user.dto';

const select = {
  id: true,
  password: false,
  name: true,
  bio: true,
};

const selectWidthPassword = {
  id: true,
  password: true,
  name: true,
  bio: true,
};

@Injectable()
export class UserService {
  constructor(
    private logger: Logger,
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  public async initAdminUser() {
    const adminUser = await this.findByName('admin');
    if (!adminUser) {
      this.create({
        name: 'admin',
        password: 'admin',
      });
    }
  }

  async query(dto: QueryUsersDto): Promise<User[] | ServiceError> {
    try {
      if (dto.pageNo && Number(dto.pageNo) !== -1) {
        return await this.repository.find({
          skip: Number((dto.pageNo - 1) * dto.pageSize),
          take: Number(dto.pageSize),
          select,
        });
      }

      return await this.repository.find({
        select,
      });
    } catch (error) {
      const msg = 'Query users failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.USER_QUERY_FAILED,
        msg,
      });
    }
  }

  async create(dto: CreateUserDto): Promise<User | ServiceError> {
    const { name, password, id } = dto;

    try {
      const userNotUnique = await this.repository.findOne({
        where: { name },
      });
      if (userNotUnique) {
        const msg = 'Input data validation failed. User already exist.';
        this.logger.error(`${msg} name: ${name}`);
        throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await argon2.hash(password);

      const dbItem = new User();
      dbItem.name = name;
      dbItem.id = id || v4();
      dbItem.password = hashedPassword;

      return await this.repository.save(dbItem);
    } catch (error) {
      const msg = 'Create user failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.USER_CREATE_FAILED,
        msg,
      });
    }
  }

  async update(dto: UpdateUserDto): Promise<User | ServiceError> {
    const { name, bio, id } = dto;
    const where = { id };
    try {
      const existUser = await this.repository.findOne({
        where,
      });
      if (!existUser) {
        const msg = 'Input data validation failed. User not found.';
        this.logger.error(`${msg} id: ${id}`);
        throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      }

      if (name) {
        existUser.name = name;
      }
      if (bio) {
        existUser.bio = bio;
      }

      return await this.repository.save(existUser);
    } catch (error) {
      const msg = 'Update user failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.USER_UPDATE_FAILED,
        msg,
      });
    }
  }

  async delete(id: string): Promise<User | ServiceError> {
    const where = { id };
    try {
      const existUser = await this.repository.findOne({
        where,
      });
      if (!existUser) {
        const msg = 'Input data validation failed. User not found.';
        this.logger.error(`${msg} id: ${id}`);
        throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      }

      return await this.repository.remove(existUser);
    } catch (error) {
      const msg = 'Delete user failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.USER_DEL_FAILED,
        msg,
      });
    }
  }

  async findById(id: string): Promise<User> {
    return await this.repository.findOne({
      where: { id },
      select,
    });
  }

  async findByName(name: string): Promise<User> {
    return await this.repository.findOne({
      where: { name },
      select: selectWidthPassword,
    });
  }

  public async isPasswordValid(
    password: string,
    userPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(userPassword, password);
  }
}
