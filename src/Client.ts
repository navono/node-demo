import { injectable, inject } from 'tsyringe';
import { SuperService } from './SuperService';

@injectable()
export default class Client {
  constructor(@inject('SuperService') private service: SuperService) {}

  hello(name: string): void {
    console.log(this.service.hello(name));
  }
}
