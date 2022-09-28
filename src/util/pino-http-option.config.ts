import { IncomingMessage, ServerResponse } from "http";
import pino from 'pino';
import * as pinoHttp from 'pino-http';

export const pinoHttpOption = (
  envMode = 'development',
  log: any,
): pinoHttp.Options => {
  return {
    customAttributeKeys: {
      // req: '请求信息',
      // res: '响应信息',
      // err: '错误信息',
      // responseTime: '响应时间（ms）',
    },
    autoLogging: true,
    quietReqLogger: true,
    level: envMode === 'development' ? 'trace' : log.level,
    timestamp: pino.stdTimeFunctions.isoTime,
    customLogLevel(_req: IncomingMessage, res: ServerResponse, err: Error) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      }

      return 'info';
    },
    // Define a custom success message
    // customSuccessMessage: function (req, res) {
    //   if (res.statusCode === 404) {
    //     return 'resource not found'
    //   }
    //   return `${req.method} completed`
    // },
    // Set to `false` to prevent standard serializers from being wrapped.
    wrapSerializers: true,
    serializers: {
      req(req: any) {
        const retVal = {
          client: req.remoteAddress,
          port: req.remotePort,
          method: req.raw.method,
          url: req.raw.url,
          httpVersion: req.raw.httpVersion,
          params: req.raw.params,
          query: req.raw.query,
          body: req.raw.body,
          headers: req.raw.headers
        }
        return retVal;
      },

      err(err: {
        params: any;
        raw: { params: any; query: any; body: any };
        query: any;
        body: any;
      }) {
        err.params = err.raw.params;
        err.query = err.raw.query;
        err.body = err.raw.body;
        return err;
      },
    },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    transport: envMode === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        // singleLine: true,
        levelFirst: true,
        ignore: '',
        translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
      }
    } : undefined,
  };
};
