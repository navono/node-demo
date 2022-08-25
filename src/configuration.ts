// import * as fse from 'fs-extra';
// import * as path from 'path';
// import * as rfs from 'rotating-file-stream';
import * as multiStream from 'pino-multi-stream';
import { LevelWithSilent as PinoLevel } from 'pino';

import { hmiConfig } from '@util/config';

export default () => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  const yamlConf = hmiConfig;
  const logConf = yamlConf.log;


  // 日志 stream 对象
  // const streams = [];
  // streams.push({
  //   level: logConf.level as PinoLevel,
  //   stream: process.stdout,
  // });

  const streams: multiStream.Streams = [
    {
      level: logConf.level as PinoLevel,
      stream: process.stdout,
    },
  ];

  if (process.env.NODE_ENV === 'production') {
    // const options: rfs.Options = {
    //   size: logConf.fileSize,
    //   interval: logConf.interval,
    //   compress: logConf.compress ? 'gzip' : false,
    //   maxFiles: logConf.maxFiles,
    // };

    // let logfile = logConf.file;
    // const logFileParsed = path.parse(logConf.file);
    // if (logFileParsed.dir !== '' && !fse.existsSync(logFileParsed.dir)) {
    //   fse.mkdirSync(logFileParsed.dir);
    // }
    // logfile = logFileParsed.name;

    // if (process.cwd().includes('dist')) {
    //   options.path = path.join('..', logFileParsed.dir);
    // } else {
    //   options.path = logFileParsed.dir;
    // }

    // const rotateStream = rfs.createStream(`${logfile}.log`, options);
    // const errStream = rfs.createStream(`${logfile}.error.log`, options);
    // console.log(rotateStream, errStream);
    // streams.push([
    //   {
    //     level: logConf.level as PinoLevel,
    //     // stream: rotateStream,
    //     stream: multiStream.prettyStream({
    //       prettifier: {
    //         ignore: '',
    //       },
    //       dest: rotateStream,
    //     }),
    //   },
    //   {
    //     level: 'error',
    //     // stream: errStream,
    //     stream: multiStream.prettyStream({
    //       prettifier: {
    //         ignore: '',
    //       },
    //       dest: errStream,
    //     }),
    //   },
    // ]);
  }

  yamlConf.streams = streams;
  return yamlConf as Record<string, any>;
};
