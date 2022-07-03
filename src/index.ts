import { greeter } from './hello';
import * as ffi from 'ffi-napi';

const dllPath = `${__dirname}/../dll/dllfornode`;
const dllForNode = ffi.Library(dllPath, {
  'add': ['int', ['int', 'int']]
});

(async () => {
  const rsp = await greeter('z');
  console.log(rsp);
})();

console.log('add', dllForNode.add(1, 2));
