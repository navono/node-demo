import { homedir } from 'os';
import * as path from 'path';
import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import * as multiStream from 'pino-multi-stream';
import { TypeOrmModule } from '@nestjs/typeorm';

import configuration from './configuration';
import { pinoHttpOption } from './util/pino-http-option.config';
import { AppController } from './app.controller';

import { ensureCustomDir } from '@util/util';
import { hostDataDirName } from '@util/config';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { ResourceModule } from '@modules/resource/resource.module';
import { GlobalModule } from '@modules/global/global.module';

import { ResourceService } from './modules/resource/resource.service';
import { UserService } from './modules/user/user.service';
import { GlobalService } from './modules/global/global.service';

const basePath = homedir();
const dataDir = ensureCustomDir(basePath, hostDataDirName);
const dbPath = ensureCustomDir(dataDir, 'db');

@Module({
  imports: [
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
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const statics = [];
        statics.push({
          rootPath: configService.get<string>('assetsStaticDir'),
          serveRoot: '/static',
        });

        if (process.env.NODE_ENV === 'production') {
          statics.push({
            rootPath: path.join(
              __dirname,
              '..',
              configService.get<string>('app.dir'),
            ),
            serveRoot: '/hmi',
          });
        } else {
          statics.push({
            rootPath: path.join(__dirname, '../public/hmi'),
            serveRoot: '/hmi',
          });
        }

        return statics;
      },
    }),
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
    private userSvc: UserService,
    private resourceSvc: ResourceService,
    private globalSvc: GlobalService,
  ) { }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply().forRoutes('*');
  }

  async onModuleInit() {
    this.logger.verbose('AppModule 初始化');

    // let publicAssets = path.join(__dirname, '../assets');
    // if (
    //   process.env.NODE_ENV === 'development' ||
    //   process.env.NODE_ENV === 'debug'
    // ) {
    //   publicAssets = path.join(__dirname, '../public/assets');
    // }
    // const constantJs = path.join(
    //   hmiConfig.assetsStaticDir,
    //   'js',
    //   'constant.js',
    // );

    // try {
    //   const stat = await fse.stat(constantJs);
    //   if (!stat.isFile()) {
    //     this.logger.verbose('初始化 assets');
    //     await fse.copy(publicAssets, hmiConfig.assetsDir);
    //   }
    // } catch (error) {
    //   this.logger.verbose('初始化 assets');
    //   await fse.copy(publicAssets, hmiConfig.assetsDir);
    // }

    /**
     * 不在各个模块的 onModuleInit 初始化是因为：
     * 1. 各个 onModuleInit 初始化不保证顺序
     * 2. 初始化数据有依赖
     */

    await this.userSvc.initAdminUser();
    await this.resourceSvc.initDefaultModelImg();
    await this.globalSvc.initGlobalConfig();
  }
}
