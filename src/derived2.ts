import Base from './base';

export default class Derived2 extends Base {
  hello = (): void => {
    console.log('hello from Derived2, sp', this.sp);
  };
}
