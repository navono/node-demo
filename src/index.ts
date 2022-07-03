import { greeter } from './hello';
import * as ffi from 'ffi-napi';

const dllPath = `${__dirname}/../dll/dllfornode`;
const dllForNode = ffi.Library(dllPath, {
  'add': ['int', ['int', 'int']]
});

(async () => {
  const rsp = await greeter('z');
  console.log(rsp);

  // current.atoi('1234'); // 1234
})();

console.log(`${__dirname}`);
console.log('dllForNode', dllForNode);
console.log('add', dllForNode.add(1, 2));
