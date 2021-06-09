function first() {
  console.log("first(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("first(): called", target, propertyKey, descriptor);
  };
}

function second() {
  console.log("second(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("second(): called", target, propertyKey, descriptor);
  };
}

function data() {
  return (target: any, name?: PropertyKey): any => {
    let val;
    const descriptor = {
      get(this: any) {
        const propertyName = `__${String(name)}`
        if (!this[propertyName]) {
          this[propertyName] = val;
        }

        return this[propertyName];
      },
      set(value: any) {
        val = value;
      },
      enumerable: true,
      configurable: true,
    };

    Object.defineProperty(target, name, descriptor);
  };
}

export class ExampleClass {
  @first()
  @second()
  fa() {
    console.log('a');
  }

  constructor() {
    this.buf = new Buffer('')
  }

  encode(): Buffer {
    return this.buf;
  }

  private buf: Buffer

  @data()
  name: string
}

