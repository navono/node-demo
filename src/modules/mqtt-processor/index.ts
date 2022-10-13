import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions } from "@nestjs/microservices";

import IpcStrategy from "./ipc.strategy";
import ProcessorModule from "./processor.module";

export async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(ProcessorModule, {
    strategy: new IpcStrategy() // 应用自定义的IPC监听策略
  });

  console.error('启动工作进程。。。');
  // 启动监听
  app.listen();
}