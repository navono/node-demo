
import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import * as multiStream from 'pino-multi-stream';

import { pinoHttpOption } from '@util/pino-http-option.config';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { MQTTModule } from '@modules/mqtt/mqtt.module';

import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (conf: ConfigService) => {
        return {
          pinoHttp: [
            pinoHttpOption(conf.get('NODE_ENV'), conf.get('log')),
            multiStream.multistream(conf.get('streams'))
          ],
        };
      },
    }),
    MQTTModule,
  ],
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(
    private logger: Logger,
  ) { }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply().forRoutes('*');
  }

  async onModuleInit() {
    this.logger.verbose('AppModule 初始化');
  }
}
