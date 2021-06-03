import { greeter } from './hello';
import { simpleProxyObj } from './proxy';

(async ()=> {
  const rsp = await greeter('z');
  console.log(rsp);
  console.log(simpleProxyObj.a);
})()

