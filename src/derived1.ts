import Base from './base';

export default class Derived1 extends Base {
  hello = (): void => {
    console.log('hello from Derived1');
  };
}
