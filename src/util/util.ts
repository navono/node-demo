import * as path from 'path';
import * as fse from 'fs-extra';
import { HttpException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

export const getUTCTimestamp = () => {
  const now = new Date();
  return Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  );
};

export const getLocalTimestamp = () => {
  return new Date().getTime();
};

export const deleteFile = async (filepath: string) => {
  if (filepath) {
    const fileStat = await fse.pathExists(filepath);
    if (fileStat) {
      await fse.remove(filepath);
    }
  }
};

export const ensureCustomDir = (basePath: string, subDirName: string) => {
  const customDirPath = path.join(basePath, subDirName);
  fse.ensureDirSync(customDirPath);
  return customDirPath;
};

/**
 * 执行 db 事务封装。在此封装内，会调用 typeorm 的开启、提交、回滚等操作。
 *
 *  对于 runner 的错误分两种情况：一种是客户端的错误；另一种是服务端的错误。
 *  如果是客户端错误，那么在 runner 中直接构造 HttpException 对象后返回，后在 rollback 中检测 HttpException 类型，然后后直接返回。
 *  在调用方的 catch 中需要再次检测 HttpException 类型，匹配后再次 throw。
 *  如果是服务端错误，那么在 runner 中直接 Promis.reject 返回错误原因，在 rollback 中构造 ServiceError 对象返回。在调用方的 catch
 *  中直接返回即可。
 * @param dataSource: typeorm 的 db 源。
 * @param runner: 执行事务操作的执行体。如果遇到需要回滚的，直接 Promise.reject 返回错误原因即可。
 * @param rollback: 在事务执行体中异常后，执行业务回滚的函数。
 * @returns
 */
export async function dbTransaction<T>(
  dataSource: DataSource,
  runner: (manager: EntityManager) => Promise<T | void>,
  rollback?: (error) => void,
): Promise<T | void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    let runnerResult;
    if (runner) {
      runnerResult = await runner(queryRunner.manager);
    }

    await queryRunner.commitTransaction();
    if (runnerResult) {
      return Promise.resolve(runnerResult);
    }
  } catch (err) {
    let rollbackErr;
    if (rollback) {
      rollbackErr = await rollback(err);
    }
    await queryRunner.rollbackTransaction();

    if (rollbackErr instanceof HttpException) {
      throw rollbackErr;
    }
    return Promise.reject(rollbackErr);
  } finally {
    await queryRunner.release();
  }
}
