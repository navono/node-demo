import { MessagePattern, Payload } from "@nestjs/microservices";
// import { TestDto } from "../dto";

export default class ProcessorController {

  // 具体业务处理函数,处理 test/+/test 主题对应的消息
  @MessagePattern('test') // DispatchController中便是根据此处名称获取到函数实例
  async processTest(@Payload() message: { topic: string, payload: any }) {
    const { topic, payload } = message;
    // TODO 处理逻辑 ...
    console.log(`工作进程处理：process id = ${process.pid}, topic = ${topic}, paylaod = `, payload);
  }
}