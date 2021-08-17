import { injectable } from 'tsyringe';
import Foo from './Foo';

@injectable()
export default class Bar {
  constructor(public myFoo: Foo) {}
}
