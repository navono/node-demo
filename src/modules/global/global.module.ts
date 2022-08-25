import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GlobalConfig } from '@entities/GlobalConfig';

import { GlobalController } from './global.controller';
import { GlobalService } from './global.service';

@Module({
  imports: [TypeOrmModule.forFeature([GlobalConfig])],
  providers: [GlobalService, Logger],
  controllers: [GlobalController],
  exports: [GlobalService],
})
export class GlobalModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*');
  }
}
