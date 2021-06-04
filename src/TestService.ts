import {SuperService} from "./SuperService";

export class TestService implements SuperService {
  hello(name: string): string {
    return `Hello ${name}`;
  }
}
