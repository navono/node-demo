import cluster from 'cluster';
import * as R from 'ramda';
import { Controller, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy, Ctx, MqttContext } from '@nestjs/microservices';

import { mqttClientService } from '@util/constant';
import { MQTTTopic } from '@common/decorators/mqtt.decorator';

import { TagSubDto } from './dto/tag-sub.dto';

@Controller()
export class MQTTController {
    constructor(private readonly logger: Logger, @Inject(mqttClientService) private client: ClientProxy) { }
    // 原生 topic
    @MessagePattern('request')
    getNotifications(@Payload() payload, @Ctx() ctx: MqttContext) {
        // this.logger.debug(`:  ${payload}`);
        // return this.client.send('response', "message from A");

        const topic = ctx.getTopic();
        // 转发
        cluster.workers[this.getWorkerId()].send({ topic, payload });
    }

    // MQTTTopic 从 config.yaml 配置文件获取
    @MQTTTopic('realtimeDataTopic')
    realtimeDataSub(@Payload() payload: TagSubDto, @Ctx() ctx) {
        this.logger.debug(`I Got Message From Client:  ${payload}, ${ctx}`);
        return this.client.send('response', "message from VxCollector adapter");
    }

    private getWorkerId = () => {
        const workerIds = R.keys(cluster.workers);
        const workerId = Math.floor(Math.random() * workerIds.length) % workerIds.length;
        return workerIds[workerId];
    }
}