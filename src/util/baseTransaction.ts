import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';

@Injectable()
export abstract class BaseTransaction<TransactionInput, TransactionOutput> {
  protected constructor(
    private readonly dataSource: DataSource,
    public readonly logger: Logger,
  ) {}

  // 事务的执行函数
  protected abstract execute(
    data: TransactionInput,
    manager: EntityManager,
  ): Promise<TransactionOutput>;

  // 事务的回滚函数。（可选）
  // 在事务的执行函数中，除了跟 db 相关的操作外，可能还有有对其他资源的操作。db 的回滚可以在 queryRunner.rollbackTransaction 中执行，
  // 而其他资源的回滚操作需要调用方在此函数中执行，例如：磁盘文件
  protected abstract rollback();

  private async createRunner(): Promise<QueryRunner> {
    return this.dataSource.createQueryRunner();
  }

  // 事务的入口函数
  async run(data: TransactionInput): Promise<TransactionOutput> {
    // since everything in Nest.js is a singleton we should create a separate
    // QueryRunner instance for each call
    const queryRunner = await this.createRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await this.execute(data, queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await this.rollback();
      await queryRunner.rollbackTransaction();

      this.logger.error(`Transaction failed: ${error}`);
      throw new Error('Transaction failed');
    } finally {
      await queryRunner.release();
    }
  }

  // this is a function that allows us to use other "transaction" classes
  // inside of any other "main" transaction, i.e. without creating a new DB transaction
  async runWithinTransaction(
    data: TransactionInput,
    manager: EntityManager,
  ): Promise<TransactionOutput> {
    return this.execute(data, manager);
  }
}
