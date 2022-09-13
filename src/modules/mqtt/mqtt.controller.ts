import { Controller, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy, Ctx } from '@nestjs/microservices';

import { mqttClientService } from '@util/constant';
import { MQTTTopic } from '@common/decorators/mqtt.decorator';

import { TagSubDto } from './dto/tag-sub.dto';

@Controller()
export class MQTTController {
    constructor(private readonly logger: Logger, @Inject(mqttClientService) private client: ClientProxy) { }
    // 原生 topic
    @MessagePattern('request')
    getNotifications(@Payload() data) {
        this.logger.debug(`Client data in getNotifications:  ${data}`);
        return this.client.send('response', "message from A");
    }

    // MQTTTopic 从 config.yaml 配置文件获取
    @MQTTTopic('realtimeDataTopic')
    realtimeDataSub(@Payload() data: TagSubDto, @Ctx() ctx) {
        this.logger.debug(`I Got Message From Client:  ${data}, ${ctx}`);
        return this.client.send('response', "message from VxCollector adapter");
    }
}