import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { getIPAdress } from '@util/util';
import { mqttClientService } from '@util/constant';
import { MQTTTopicDecoratorService } from '@common/decorators/mqtt.decorator';

import { MQTTController } from './mqtt.controller';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: mqttClientService,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            transport: Transport.MQTT,
            options: {
              url: `${config.get<string>('mqtt.host')}:${config.get<string>('mqtt.port')}`,
              path: config.get<string>('mqtt.path'),
              clientId: `vxcollector-adapter_${getIPAdress()}_sender`,
              username: 'vxsip',
              password: 'vxsip'
            }
          }
        }
      }
    ])
  ],
  providers: [Logger, MQTTTopicDecoratorService],
  controllers: [MQTTController],
  exports: [MQTTTopicDecoratorService],
})
export class MQTTModule { }
