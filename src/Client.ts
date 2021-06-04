import {injectable, inject} from "tsyringe";
import { SuperService } from './SuperService'

@injectable()
export class Client {
  constructor(@inject("SuperService") private service: SuperService) {}

  hello(name: string) {
    console.log(this.service.hello(name));
  }
}
