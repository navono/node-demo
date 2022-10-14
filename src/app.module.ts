import { homedir } from 'os';
import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import * as multiStream from 'pino-multi-stream';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusMonitorModule, StatusMonitorConfiguration } from 'nest-status-monitor';

import { ensureCustomDir } from '@util/util';
import { hostDataDirName } from '@util/config';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { ResourceModule } from '@modules/resource/resource.module';
import { GlobalModule } from '@modules/global/global.module';

import configuration from './configuration';
import { pinoHttpOption } from './util/pino-http-option.config';
import { AppController } from './app.controller';

const basePath = homedir();
const dataDir = ensureCustomDir(basePath, hostDataDirName);
const dbPath = ensureCustomDir(dataDir, 'db');

const statusMonitorConfig: StatusMonitorConfiguration = {
  pageTitle: 'Nest.js Monitoring Page',
  port: 3001,
  path: '/status',
  ignoreStartsWith: '/healt/alive',
  healthChecks: [
    {
      protocol: 'http',
      host: 'localhost',
      path: '/health/alive',
      port: 3001,
    },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/health/dead',
      port: 3001,
    },
  ],
  spans: [
    {
      interval: 1, // Every second
      retention: 60, // Keep 60 datapoints in memory
    },
    {
      interval: 5, // Every 5 seconds
      retention: 60,
    },
    {
      interval: 15, // Every 15 seconds
      retention: 60,
    },
    {
      interval: 60, // Every 60 seconds
      retention: 600,
    },
  ],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,
    statusCodes: true,
  },
};

@Module({
  imports: [
    StatusMonitorModule.setUp(statusMonitorConfig),
    EventEmitterModule.forRoot(),
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (conf: ConfigService) => {
        return {
          type: 'sqlite',
          database: `${dbPath}/${conf.get('db.sqlite')}`,
          autoLoadEntities: true,
          // logging: true,
          synchronize: true,
        }
      }
    }),
    // ServeStaticModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     const statics = [];
    //     statics.push({
    //       rootPath: configService.get<string>('assetsStaticDir'),
    //       serveRoot: '/static',
    //     });

    //     if (process.env.NODE_ENV === 'production') {
    //       statics.push({
    //         rootPath: path.join(
    //           __dirname,
    //           '..',
    //           configService.get<string>('app.dir'),
    //         ),
    //         serveRoot: '/hmi',
    //       });
    //     } else {
    //       statics.push({
    //         rootPath: path.join(__dirname, '../public/hmi'),
    //         serveRoot: '/hmi',
    //       });
    //     }

    //     return statics;
    //   },
    // }),
    AuthModule,
    UserModule,
    ResourceModule,
    GlobalModule,
  ],
  controllers: [AppController],
  providers: [Logger],
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

    /**
     * 不在各个模块的 onModuleInit 初始化是因为：
     * 1. 各个 onModuleInit 初始化不保证顺序
     * 2. 初始化数据有依赖
     */

    // await this.userSvc.initAdminUser();
    // await this.resourceSvc.initDefaultModelImg();
    // await this.globalSvc.initGlobalConfig();
  }
}
