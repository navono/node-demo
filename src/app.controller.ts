import { interval } from 'rxjs';
import { Controller, Get, UseInterceptors, Logger } from '@nestjs/common';
import * as ID from 'nodejs-unique-numeric-id-generator';

import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { getUTCTimestamp } from '@util/util';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly logger: Logger) {

    const numbers = interval(500);
    const subscription = numbers.subscribe(x => console.error('Next: ', x));
    setTimeout(() => {
      subscription.unsubscribe();
    }, 5000);
  }

  @Get('/')
  @UseInterceptors(ResponseInterceptor)
  hello() {
    try {
      this.logger.debug('Root');

      return 'Hello Nestjs Template!'
    } catch (error) {
      console.error('HTTP request failed.', error);
    }

    return 'error!';
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
