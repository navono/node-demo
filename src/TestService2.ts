import {SuperService} from "./SuperService";

export class TestService2 implements SuperService {
  hello(name: string): string {
    return `TestService2 Hello ${name}`;
  }
}
