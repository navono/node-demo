import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern } from '@nestjs/microservices';

const MQTT_TOPIC_METADATA = '__mqtt-topic-candidate';

export function MQTTTopic(variable: string | keyof ConfigService): any {
  return (
    _target: any,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(
      MQTT_TOPIC_METADATA,
      variable,
      descriptor.value,
    );
    return descriptor;
  };
}

@Injectable()
export class MQTTTopicDecoratorService {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
  }

  processTopicDecorators(types: any[]) {
    for (const type of types) {
      const propNames = Object.getOwnPropertyNames(type.prototype);
      for (const prop of propNames) {
        const propValue = Reflect.getMetadata(
          MQTT_TOPIC_METADATA,
          Reflect.get(type.prototype, prop),
        );

        if (propValue) {
          const topic = this.configService.get(`mqtt.topics.${propValue}`);
          if (topic) {
            this.logger.verbose(`${type.name}#${prop} subscribe topic: ${topic}`);
            Reflect.decorate(
              [MessagePattern(topic)],
              type.prototype,
              prop,
              Reflect.getOwnPropertyDescriptor(type.prototype, prop),
            );
          } else {
            this.logger.error(`Get topic: ${propValue} from config file failed.`);
          }
        }
      }
    }
  }
}