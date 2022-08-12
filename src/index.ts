import * as path from 'path';
import { replaceInFile } from 'replace-in-file';

// import { greeter } from './hello';
// import ReadLines from './readlines';


const options = {
  files: path.join(__dirname, '../resource', '123.pic'),
  from: /@123@/g,
  to: '我是点组项123',
};


(async () => {
  // const rsp = await greeter('z');
  // console.log(rsp, ReadLines);

  // const rl = new ReadLines('D:\\a.txt');

  // let line = rl.next();
  // let lineNumber = 0;
  
  // while (line) {
  //     console.log('Line ' + lineNumber + ': ' + line.toString('utf8'));
  //     lineNumber++;

  //     line = rl.next()
  // }

  try {
    const results = await replaceInFile(options)
    console.log('Replacement results:', results);
  }
  catch (error) {
    console.error('Error occurred:', error);
  }

})();
