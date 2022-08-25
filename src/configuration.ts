import * as fse from 'fs-extra';
import * as path from 'path';
import { LevelWithSilent as PinoLevel } from 'pino';

import { hmiConfig } from '@util/config';

export default () => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }

  const yamlConf = hmiConfig;
  const logConf = yamlConf.log;

  // 日志 stream 对象
  const streams = [];
  streams.push({
    level: logConf.level as PinoLevel,
    stream: process.stdout,
  });

  if (process.env.NODE_ENV === 'production') {
    let logfile = logConf.file;
    const logFileParsed = path.parse(logConf.file);
    if (logFileParsed.dir !== '' && !fse.existsSync(logFileParsed.dir)) {
      fse.mkdirSync(logFileParsed.dir);
    }
    logfile = logFileParsed.name;
    if (process.cwd().includes('dist')) {
      logfile = path.join('..', logFileParsed.dir, logfile);
    } else {
      logfile = path.join(logFileParsed.dir, logfile);
    }

    const option = { filename: `${logfile}`, verbose: false, frequency: "custom", date_format: "YYYY-MM-DD-A", max_logs: '7d', size: "50k", extension: ".log" }
    streams.push({
      level: logConf.level as PinoLevel,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      stream: require('file-stream-rotator').getStream(option)
    }
    );
  }

  yamlConf.streams = streams;
  return yamlConf as Record<string, any>;
};
