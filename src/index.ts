import { greeter } from './hello';
import { fastAwaitTest } from './fast-await';
import { slowAwaitTest } from './slow-await';

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
})();
