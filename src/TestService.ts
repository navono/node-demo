import { SuperService } from './SuperService';

export default class TestService implements SuperService {
  hello(name: string): string {
    return `TestService Hello ${name}`;
  }
}
