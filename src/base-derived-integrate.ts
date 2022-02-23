import Derived1 from './derived1';
import Derived2 from './derived2';

export default class SP {
  public d1 = new Derived1(this);

  public d2 = new Derived2(this);

  hello = (): void => {
    this.d1.hello();
    this.d2.hello();
  };
}
