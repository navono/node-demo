import { injectable, } from 'inversify';

@injectable()
export class Application {
  async start(): Promise<void> {
    console.log('application start');
    return Promise.resolve();
  }
}
