import { HttpException, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private logger: Logger) {
    super()
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const rsp = exception.getResponse() as any;
    const args = host.getArgByIndex(0);
    this.logger.error(`Request invalid: ${JSON.stringify(args)} with ${JSON.stringify(rsp.message)}`);
  }
}
