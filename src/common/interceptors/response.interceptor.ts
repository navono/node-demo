import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import * as R from 'ramda';

export interface Response<T> {
  code: number;
  msg: any;
  data: T | string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly logger: Logger) { }

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        this.logger.verbose('res data: ', data);

        if (R.has('code', data)) {
          return { data: '', code: (data as any).code, msg: (data as any).msg };
        }
        return { data, code: 0, msg: 'success' };
      }),
    );
  }
}