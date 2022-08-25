import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  Global,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Resource } from '@entities/Resource';

import { ResourceController } from './resource.controller';
import { ResourceService, ImportTransaction } from './resource.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Resource])],
  providers: [ResourceService, Logger, ImportTransaction],
  controllers: [ResourceController],
  exports: [ResourceService],
})
export class ResourceModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*');
  }
}
