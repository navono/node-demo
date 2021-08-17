import { injectable, inject, delay } from 'tsyringe';
import Foo from './Foo';

@injectable()
export default class Bar {
  constructor(@inject(delay(() => Foo)) public foo: Foo) {}

  hello = (): void => {
    console.log('hello from Bar');
  };
}
