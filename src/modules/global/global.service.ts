import * as R from 'ramda';
import { v4 } from 'uuid';
import { Mutex } from 'async-mutex';
import { Injectable, Logger, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { toolbarLayoutName } from '@util/constant';
import { ServiceStatus } from '@common/error/code.error';
import { ServiceError } from '@common/error/service.error';
import { GlobalConfig } from '@entities/GlobalConfig';

import { CreateGlobalConfigDto, UpdateGlobalConfigDto } from './dto';

const select = {
  id: true,
  name: true,
  value: true,
};

@Injectable()
export class GlobalService {
  private mutex = new Mutex();

  private pageCustomSize = 'pageCustomSize';

  private globalConfig = 'globalConfig';

  private toolbarLayout = {
    currentIndex: 0,
    type: 'tab-area',
    widgets: [
      // {
      //   "category": "immigrate",
      //   "visible": true,
      // },
    ],
  };

  constructor(
    private readonly logger: Logger,
    @InjectRepository(GlobalConfig)
    private readonly repository: Repository<GlobalConfig>,
  ) {}

  public async initGlobalConfig() {
    await this.initPageCustomSize();
    await this.initCustomGlobalConfig();
    await this.initToolbarDockLayout();
  }

  async create(
    dto: CreateGlobalConfigDto,
  ): Promise<GlobalConfig | ServiceError> {
    await this.mutex.waitForUnlock();
    const release = await this.mutex.acquire();

    try {
      const existItem = await this.repository.findOne({
        where: { name: dto.name },
        select,
      });

      if (existItem) {
        const msg =
          'Input data validation failed. Global config already exist.';
        this.logger.error(`${msg} name: ${dto.name}`);
        throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      }

      const dbItem = new GlobalConfig();
      dbItem.id = v4();
      dbItem.name = dto.name;
      dbItem.value = dto.value;
      return await this.repository.save(dbItem);
    } catch (error) {
      const msg = 'Create global config item failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.GLOBAL_CREATE_FAILED,
        msg,
      });
    } finally {
      release();
    }
  }

  async findAll(): Promise<GlobalConfig[] | ServiceError> {
    return await this.repository.find({ select });
  }

  async findOne(name: string): Promise<GlobalConfig | ServiceError> {
    const existItem = await this.repository.findOne({
      where: { name },
      select,
    });

    if (!existItem) {
      const msg = 'Input data validation failed. Global config not exist.';
      this.logger.error(`${msg} name: ${name}`);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }

    return existItem;
  }

  async delete(name: string): Promise<GlobalConfig | ServiceError> {
    await this.mutex.waitForUnlock();
    const release = await this.mutex.acquire();

    try {
      const existItem = await this.repository.findOne({
        where: { name },
        select,
      });

      if (!existItem) {
        const msg = 'Input data validation failed. Global config not exist.';
        this.logger.error(`${msg} name: ${name}`);
        throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      }

      return await this.repository.remove(existItem);
    } catch (error) {
      const msg = 'Delete global config item failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.GLOBAL_DEL_FAILED,
        msg,
      });
    } finally {
      release();
    }
  }

  async update(
    name: string,
    dto: UpdateGlobalConfigDto,
  ): Promise<GlobalConfig | ServiceError> {
    await this.mutex.waitForUnlock();
    const release = await this.mutex.acquire();

    try {
      const existItem = await this.repository.findOne({
        where: { name },
        select,
      });

      if (!existItem) {
        const msg = 'Input data validation failed. Global config not exist.';
        this.logger.error(`${msg} name: ${name}`);
        throw new HttpException(msg, HttpStatus.BAD_REQUEST);
      }

      existItem.value = dto.value;

      return this.repository.save(existItem);
    } catch (error) {
      const msg = 'Update global config item failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.GLOBAL_UPDATE_FAILED,
        msg,
      });
    } finally {
      release();
    }
  }

  private async initPageCustomSize() {
    const existItem = await this.repository.findOneBy({
      name: this.pageCustomSize,
    });

    if (!existItem) {
      const dbItem = new GlobalConfig();
      dbItem.id = v4();
      dbItem.name = this.pageCustomSize;
      await this.repository.save(dbItem);
    }
  }

  private async initCustomGlobalConfig() {
    const existItem = await this.repository.findOneBy({
      name: this.globalConfig,
    });

    if (!existItem) {
      const dbItem = new GlobalConfig();
      dbItem.id = v4();
      dbItem.name = this.globalConfig;
      dbItem.value = JSON.stringify([
        {
          decimal: 2,
        },
      ]);
      await this.repository.save(dbItem);
    }
  }

  private async initToolbarDockLayout() {
    const existItem = await this.repository.findOneBy({
      name: toolbarLayoutName,
    });

    if (!existItem) {
      const select = {
        id: true,
      };

      const existToolbarCategory = await this.repository.find({
        select,
      });

      this.toolbarLayout.widgets = R.pipe(
        R.map((c: any) => {
          return {
            category: c.id,
            visible: true,
          };
        }),
        R.uniq,
      )(existToolbarCategory);

      const dbItem = new GlobalConfig();
      dbItem.id = v4();
      dbItem.name = toolbarLayoutName;
      dbItem.value = JSON.stringify(this.toolbarLayout);
      await this.repository.save(dbItem);
    }
  }
}
