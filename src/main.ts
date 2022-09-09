import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

import { getIPAdress } from '@util/util';
import { MQTTTopicDecoratorService } from '@/common/decorators/mqtt.decorator';
import { MQTTController } from '@modules/mqtt/mqtt.controller';

import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const logger = app.get(Logger);
    app.useLogger(logger);

    // 动态设置 topic
    app.get(MQTTTopicDecoratorService).processTopicDecorators([MQTTController]);

    const configService = app.get(ConfigService);
    // 用于接收 MQTT 消息
    app.connectMicroservice({
      transport: Transport.MQTT,
      options: {
        url: configService.get('mqtt.host'),
        port: configService.get('mqtt.port'),
        path: configService.get('mqtt.path'),
        clientId: `vxcollector-adapter_${getIPAdress()}_receiver`,
        username: 'vxsip',
        password: 'vxsip'
      }
    });


    app.startAllMicroservices();
  } catch (error) {
    console.log('Microservice start failed: ', error);
  }
}

bootstrap();
