import { greeter } from './hello';
import { ExampleClass } from './decorator';

(async ()=> {
  const rsp = await greeter('z');
  console.log(rsp);

  const ec = new ExampleClass();
  ec.fa();
  ec.name = 'a';
  console.log(ec.name);
})()
