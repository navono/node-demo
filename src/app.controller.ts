import { Controller, Get, UseInterceptors, Logger } from '@nestjs/common';
import * as ID from 'nodejs-unique-numeric-id-generator';
import * as MQTT from 'async-mqtt';
import { Semaphore } from 'async-mutex';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { getUTCTimestamp } from '@util/util';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  // private mutex = new Mutex();
  private semaphore = new Semaphore(1);

  private mqttClient: MQTT.AsyncMqttClient

  constructor(private readonly logger: Logger) {
    this.mqttClient = MQTT.connect('mqtt://localhost:1883');

    this.mqttClient.on('connect', (packet: any) => {
      console.error('packet', packet)
      this.mqttClient.subscribe('supcon').then(val => {
        this.logger.debug('recv mqtt ', val)
      }).catch(reasone => {
        this.logger.error('mqtt error', reasone)
      });
    });
  }

  @Get('/')
  @UseInterceptors(ResponseInterceptor)
  async hello() {
    const [semNumber, isRelease] = await this.semaphore.acquire();
    this.logger.debug('semNumber', semNumber);

    this.mqttClient.on('message', (topic, message) => {

      // message is Buffer
      console.log(topic, message.toString());
      this.semaphore.runExclusive(() => { Promise.resolve('10') });

      isRelease();
    });

    await this.mqttClient.publish('supcon.monitor.writetag', 'hello from nestjs');

    await this.semaphore.waitForUnlock();
    // this.logger.debug('semaphore unlock');

    // let taskCalls = 0;

    // const awaitUnlockWrapper = async () => {
    //   await this.semaphore.waitForUnlock();
    //   taskCalls++;
    // };

    // const lock = this.semaphore.acquire();
    // this.semaphore.acquire();

    // awaitUnlockWrapper();
    // awaitUnlockWrapper();
    // await clock.tickAsync(0);

    // // assert.strictEqual(taskCalls, 0);

    // const [, releaser] = await lock;
    // releaser();
    // await clock.tickAsync(0);

    return 'Hello Nestjs Template!'
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
