import * as R from 'ramda';
import * as fse from 'fs-extra';
import * as Zip from 'adm-zip';
import * as iconv from 'iconv-lite';
import { v4 } from 'uuid';
import * as path from 'path';
import { Mutex } from 'async-mutex';
import { Injectable, Logger, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Like } from 'typeorm';

import { BaseTransaction } from '@util/baseTransaction';
import { deleteFile, dbTransaction } from '@util/util';
import { presetConfig } from '@/util/preset';
import { compressPrefix } from '@util/constant';
import { hmiConfig } from '@util/config';
import { ServiceError } from '@common/error/service.error';
import { ServiceStatus } from '@common/error/code.error';
import { Resource } from '@entities/Resource';

import { ImportResourceDto, QueryResourcesDto, UpdateResourceDto } from './dto';

const select = {
  id: true,
  name: true,
  description: true,
  category: true,
  subFolder: true,
  urlPath: true,
  preset: true,
};

const selectWithDiskPath = {
  ...select,
  diskPath: true,
};

export { select };

interface ImportTransactionInput {
  dto: ImportResourceDto;
  file: Express.Multer.File;
}

@Injectable()
export class ImportTransaction extends BaseTransaction<
  ImportTransactionInput,
  Resource
> {
  private resourcePath = '';

  private importedFilePath = '';

  constructor(dataSource: DataSource, logger: Logger) {
    super(dataSource, logger);
  }

  protected async execute(
    data: ImportTransactionInput,
    manager: EntityManager,
  ): Promise<Resource> {
    const { dto, file } = data;
    this.resourcePath = path.join(hmiConfig.staticResourceDir, dto.id);
    this.importedFilePath = file.path;

    try {
      const parsedFilename = path.parse(file.originalname);
      this.resourcePath += parsedFilename.ext;

      const newRes = new Resource();
      newRes.id = dto.id;
      newRes.name = dto.name || parsedFilename.name;
      newRes.description = dto.description || '';
      newRes.category = dto.category;
      newRes.diskPath = this.resourcePath;
      newRes.preset = dto.preset || false;
      newRes.urlPath = `/static/resource/${dto.id}${parsedFilename.ext}`;

      await fse.move(file.path, this.resourcePath);
      await fse.remove(
        path.join(hmiConfig.uploadResourceDir, file.originalname),
      );
      return await manager.save(newRes);
    } catch (error) {
      const msg = 'Import resource item failed.';
      this.logger.error(`${msg} error: ${error}`);

      return Promise.reject(
        ServiceError.create({
          code: ServiceStatus.RES_IMPORT_FAILED,
          msg,
        }),
      );
    }
  }

  protected async rollback() {
    await deleteFile(this.resourcePath);
    await deleteFile(this.importedFilePath);
  }
}

@Injectable()
export class ResourceService {
  private mutex = new Mutex();

  constructor(
    private readonly logger: Logger,
    @InjectRepository(Resource)
    private readonly repository: Repository<Resource>,
    private readonly dataSource: DataSource,
    private readonly importTransaction: ImportTransaction,
  ) { }

  public async initDefaultModelImg() {
    const modelRes = await this.repository.findOne({
      where: { category: 'model' },
    });
    if (!modelRes) {
      this.logger.verbose('初始化 HMI 标准化图元库');

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const resPaths = [];
      const tmpPath = path.join(presetConfig.sysModelImgPath, 'tmp');
      try {
        // 默认解压此目录下的 7z 文件夹，统一解压到 temp 目录后导入到数据库中
        await fse.ensureDir(tmpPath);
        const dirList = await this.decompressImg(
          presetConfig.sysModelImgPath,
          tmpPath,
        );

        // 以根目录下的子文件夹作为 subFolder，以 model 作为 category
        const dirResList: { dir: string; images: Resource[] }[] = [];
        for (let idx = 0; idx < dirList.length; idx++) {
          const imgDir = dirList[idx];
          const dirImgList = await this.deepLoopTraversal(imgDir, imgDir);

          dirResList.push({
            dir: imgDir,
            images: dirImgList,
          });
        }

        for (let idx = 0; idx < dirResList.length; idx++) {
          const dirRes = dirResList[idx];
          const images = dirRes.images;

          const dbItemList = [];
          for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
            const res = images[imgIdx];
            let resPath = path.join(hmiConfig.staticResourceDir, res.id);
            const parsedFilename = path.parse(res.name);
            resPath += parsedFilename.ext;

            const dbItem = new Resource();
            dbItem.id = res.id;
            dbItem.name = parsedFilename.name || '';
            dbItem.description = res.description || '';
            dbItem.category = res.category;
            dbItem.diskPath = resPath;
            dbItem.preset = res.preset || false;
            dbItem.subFolder = res.subFolder;
            dbItem.urlPath = `/static/resource/${res.id}${parsedFilename.ext}`;

            await fse.copyFile(
              path.join(dirRes.dir, res.subFolder, res.name),
              resPath,
            );

            resPaths.push(resPath);
            dbItemList.push(dbItem);
          }

          const bulkList = R.splitEvery(500, dbItemList);
          for (let idx = 0; idx < bulkList.length; idx++) {
            const bulkItems = bulkList[idx];
            await queryRunner.manager
              .createQueryBuilder()
              .insert()
              .into(Resource)
              .values(bulkItems)
              .execute();
          }
        }

        await queryRunner.commitTransaction();

        this.logger.verbose('HMI 标准化图元库初始化完成');
      } catch (error) {
        for (let idx = 0; idx < resPaths.length; idx++) {
          const resFile = resPaths[idx];
          deleteFile(resFile);
        }

        await queryRunner.rollbackTransaction();
        this.logger.error(`HMI 标准化图元库初始化失败。error: ${error}`);
      } finally {
        await deleteFile(tmpPath);
        await queryRunner.release();
      }
    }
  }

  private decompressImg = async (rootPath: string, decompressPath: string) => {
    const fileList = await fse.readdir(rootPath);

    const dirList = [];
    for (let i = 0, len = fileList.length; i < len; i++) {
      const filename = fileList[i];
      const filePath = path.join(rootPath, filename);
      const stats = await fse.stat(filePath);
      if (stats.isFile()) {
        const parsedFilename = path.parse(filename);
        if (parsedFilename.ext === compressPrefix) {
          const zip = new Zip.default(filePath);
          zip.getEntries().forEach((entry) => {
            entry.entryName = iconv.decode(entry.rawEntryName, 'gbk');
          });
          this.logger.verbose(
            `解压模型压缩包: ${filename}，将其解压到 ${decompressPath}`,
          );
          zip.extractAllTo(decompressPath, true);
          dirList.push(path.join(decompressPath, parsedFilename.name));
        }
      }
    }
    return dirList;
  };

  private deepLoopTraversal = async (dir: string, baseDir: string) => {
    let fileRes: Resource[] = [];

    const fileList = await fse.readdir(dir);
    for (let i = 0, len = fileList.length; i < len; i++) {
      const filename = fileList[i];
      const filePath = path.join(dir, filename);
      const stats = await fse.stat(filePath);
      if (stats.isDirectory()) {
        const subFileRes = await this.deepLoopTraversal(filePath, baseDir);
        fileRes = R.concat(fileRes)(subFileRes);
      } else {
        const isFile = stats.isFile();
        const extname = isFile ? path.extname(filePath) : '';
        if (extname === '.svg' || extname === '.png') {
          const res = new Resource();
          res.diskPath = '';
          res.id = v4();
          res.name = filename;
          res.description = '';
          res.preset = true;
          res.category = 'model';
          res.subFolder = dir.substring(baseDir.length + 1);

          fileRes.push(res);
        } else {
          this.logger.warn(`流程图模型资源暂时只支持 svg、png 格式。`);
        }
      }
    }

    return fileRes;
  };

  async import(
    dto: ImportResourceDto,
    file: Express.Multer.File,
  ): Promise<Resource | ServiceError> {
    const existRes = await this.repository.findOneBy({ id: dto.id });
    if (existRes) {
      const msg = 'Input data validation failed. Resource already exist.';
      this.logger.error(`${msg} id: ${dto.id}`);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }

    await this.mutex.waitForUnlock();
    const release = await this.mutex.acquire();
    try {
      return await this.importTransaction.run({ dto, file });
    } finally {
      release();
    }
  }

  async query(dto: QueryResourcesDto): Promise<Resource[] | ServiceError> {
    try {
      let filter;
      if (dto.queryKey) {
        filter = {
          name: Like(`%${dto.queryKey}%`),
        };
      }

      if (dto.category) {
        filter = {
          ...filter,
          category: dto.category,
        };
      }

      if (dto.pageNo && Number(dto.pageNo) !== -1) {
        return await this.repository.find({
          where: filter,
          order: {
            updateAt: 'DESC',
          },
          skip: Number((dto.pageNo - 1) * dto.pageSize),
          take: Number(dto.pageSize),
          select,
        });
      }

      return await this.repository.find({
        where: filter,
        order: {
          updateAt: 'DESC',
        },
        select,
      });
    } catch (error) {
      const msg = 'Query resources item failed.';
      this.logger.error(`${msg} error: ${error}`);
      return ServiceError.create({
        code: ServiceStatus.RES_QUERY_FAILED,
        msg,
      });
    }
  }

  async queryById(id: string): Promise<Resource | ServiceError> {
    return await this.getResourceItem(id, null, false);
  }

  async deleteById(id: string): Promise<Resource | ServiceError> {
    await this.mutex.waitForUnlock();
    const release = await this.mutex.acquire();
    try {
      let deletedRes;
      await dbTransaction(
        this.dataSource,
        async (manager) => {
          deletedRes = await this.getResourceItem(id, manager, true);
          if (deletedRes instanceof ServiceError) {
            return deletedRes;
          }

          await manager.delete(Resource, { id });
          await fse.remove(deletedRes.diskPath);

          return null;
        },
        (error) => {
          const msg = 'Delete resource item failed.';
          this.logger.error(`${msg} error: ${error}`);
          return ServiceError.create({
            code: ServiceStatus.RES_DEL_FAILED,
            msg,
          });
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { diskPath, ...rest } = deletedRes;
      return rest;
    } finally {
      release();
    }
  }

  async update(
    id: string,
    dto: UpdateResourceDto,
  ): Promise<Resource | ServiceError> {
    const resultRes = await this.getResourceItem(id, null, true);
    if (resultRes instanceof ServiceError) {
      return resultRes;
    }

    if (dto.name) {
      resultRes.name = dto.name;
    }
    if (dto.description) {
      resultRes.name = dto.description;
    }
    if (dto.category) {
      resultRes.category = dto.category;
    }
    if (dto.content) {
      await fse.writeFile(resultRes.diskPath, dto.content);
    }

    return await this.repository.save(resultRes);
  }

  private async getResourceItem(
    id: string,
    manager?: EntityManager,
    withDiskPath?: boolean,
  ): Promise<Resource | ServiceError> {
    let existRes;
    let finalSelect = select;
    if (withDiskPath) {
      finalSelect = selectWithDiskPath;
    }
    if (manager) {
      existRes = await manager.findOne(Resource, {
        select: finalSelect,
        where: { id },
      });
    } else {
      existRes = await this.repository.findOne({
        select: finalSelect,
        where: { id },
      });
    }

    if (!existRes) {
      const msg = 'Input data validation failed. Resource not exist.';
      this.logger.error(`${msg}, id: ${id}`);
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }

    return existRes;
  }
}
