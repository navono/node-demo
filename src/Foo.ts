import { injectable, inject, delay } from 'tsyringe';
import Bar from './Bar';

@injectable()
export default class Foo {
  constructor(@inject(delay(() => Bar)) public bar: Bar) {}

  hello = (): void => {
    console.log('hello from Foo');
  };
}
