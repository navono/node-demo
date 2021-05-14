import { greeter } from './hello';

(async ()=> {
  const rsp = await greeter('z');
  console.log(rsp);
})()

