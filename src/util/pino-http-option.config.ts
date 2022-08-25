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
    autoLogging: false,
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
    serializers: {
      req(req: {
        httpVersion: any;
        raw: { httpVersion: any; params: any; query: any; body: any };
        params: any;
        query: any;
        body: any;
      }) {
        req.httpVersion = req.raw.httpVersion;
        req.params = req.raw.params;
        req.query = req.raw.query;
        req.body = req.raw.body;
        return req;
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
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        // singleLine: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l o'
      }
    },
  };
};
