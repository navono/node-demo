
import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import * as multiStream from 'pino-multi-stream';

import { MQTTModule } from '@modules/mqtt/mqtt.module';
import { pinoHttpOption } from '@util/pino-http-option.config';

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
