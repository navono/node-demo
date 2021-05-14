import { greeter } from './hello';
import { fastAwaitTest, fastAwaitWithSlowRejectTest, fastAwaitWithFastRejectTest } from './fast-await';
import { slowAwaitTest, slowAwaitErrorTest } from './slow-await';

async function hello() {
  return 'Hello';
}

(async () => {
  console.log(hello());

  const rsp = await greeter('z');
  hello().then(console.log);
  console.log(rsp);

  await fastAwaitTest();
  await slowAwaitTest();

  await  fastAwaitWithSlowRejectTest();
  await  slowAwaitErrorTest();

  await fastAwaitWithFastRejectTest();

})();
