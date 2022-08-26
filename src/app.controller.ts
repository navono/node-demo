import { Controller, Get, UseInterceptors, Logger } from '@nestjs/common';
import * as ID from 'nodejs-unique-numeric-id-generator';
import * as MQTT from 'async-mqtt';
import { Semaphore, SemaphoreInterface, withTimeout } from 'async-mutex';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { getUTCTimestamp } from '@util/util';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  private semaphore: SemaphoreInterface;

  private mqttClient: MQTT.AsyncMqttClient;

  constructor(private readonly logger: Logger) {
    this.semaphore = withTimeout(new Semaphore(1), 2000, new Error('Timeout'))

    this.mqttClient = MQTT.connect('mqtt://localhost:1883');

    this.mqttClient.on('connect', () => {
      this.mqttClient.subscribe('supcon').then(() => {
        this.logger.debug('成功订阅主题 「supcon」');
      }).catch(reasone => {
        this.logger.debug('订阅主题 「supcon」失败：', reasone);
      });
    });
  }

  @Get('/')
  @UseInterceptors(ResponseInterceptor)
  async hello() {
    const [, releaseSemaphore] = await this.semaphore.acquire();

    setTimeout(() => releaseSemaphore(), 2000);
    let recvMsg;
    this.mqttClient.on('message', (topic, message) => {
      this.logger.debug(topic, message.toString());
      this.semaphore.runExclusive(() => { Promise.resolve('10') });
      recvMsg = message.toString();
      releaseSemaphore();
    });

    await this.mqttClient.publish('supcon.monitor.writetag', 'hello from nestjs');
    await this.semaphore.waitForUnlock();

    return recvMsg;
  }

  @Get('id/getId')
  @ApiOperation({
    summary: '唯一 ID',
    description: '获取从服务器上分配的唯一 ID（数值型）',
  })
  @ApiResponse({
    status: 200,
    description: '返回唯一 ID',
    type: Number,
  })
  @UseInterceptors(ResponseInterceptor)
  uniqueId() {
    const utc = getUTCTimestamp();
    const id = ID.generate(new Date().toJSON());
    return { data: id, lastOperateTime: utc };
  }
}
