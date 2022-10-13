import { CustomTransportStrategy, Server, Transport } from '@nestjs/microservices';

export default class IpcStrategy extends Server implements CustomTransportStrategy {
  transportId?: symbol | Transport;

  getHandlerName = (topic: string) => {
    console.error('getHandlerName: ', topic);
    return 'test';
  }

  listen = (callback: (...optionalParams: unknown[]) => any) => {
    process.on('message', (msg: { topic: string, payload: any }) => {
      const { topic } = msg;
      const handlerName = this.getHandlerName(topic);
      if (handlerName) {
        const handler = this.getHandlerByPattern(handlerName);
        if (handler) {
          handler(msg);
        }
      }
    });
    callback();
  }

  close = (): any => {
    process.exit(0);
  }
}